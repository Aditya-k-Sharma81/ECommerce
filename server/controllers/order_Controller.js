import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Stripe from 'stripe';
import User from '../models/User.js';

// Place Order COD : /api/order/cod
export const placeOrderCOD = async (req, res) => {
    try {
        const { items, address } = req.body;
        const userId = req.userId;

        if (!address || items.length === 0) {
            return res.json({ success: false, message: "Invalid data" });
        }

        // calculate amount Using Items
        let amount = await items.reduce(async (acc, item) => {
            const product = await Product.findById(item.product);
            return (await acc) + product.offerPrice * item.quantity;
        }, 0);

        amount += Math.floor(amount * 0.02);

        await Order.create({
            userId, items, amount, address, paymentType: "COD"
        })

        // Clear user cart
        await User.findByIdAndUpdate(userId, { cartItems: {} });

        return res.json({ success: true, message: "Order Placed successfully" });
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// Place Order Stripe : /api/order/stripe
export const placeOrderStripe = async (req, res) => {
    try {
        const { items, address } = req.body;
        const userId = req.userId;
        const { origin } = req.headers;

        if (!address || items.length === 0) {
            return res.json({ success: false, message: "Invalid data" });
        }

        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

        let amount = 0;
        let productData = [];

        // calculate amount Using Items
        for (const item of items) {
            const product = await Product.findById(item.product);
            productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity
            });
            amount += product.offerPrice * item.quantity;
        }

        const deliveryCharge = Math.floor(amount * 0.02);
        amount += deliveryCharge;

        const order = await Order.create({
            userId, items, amount, address, paymentType: "Online"
        });

        // create line items for stripe
        const line_items = productData.map((item) => {
            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.round(item.price * 100)
                },
                quantity: item.quantity,
            }
        });

        if (deliveryCharge > 0) {
            line_items.push({
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: "Delivery Charge",
                    },
                    unit_amount: Math.round(deliveryCharge * 100)
                },
                quantity: 1,
            });
        }

        // create session
        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${origin}/loader?next=my-orders`,
            cancel_url: `${origin}/cart`,
            metadata: {
                orderId: order._id.toString(),
                userId,
            }
        })

        // Clear user cart (Immediate UX)
        await User.findByIdAndUpdate(userId, { cartItems: {} });

        return res.json({ success: true, url: session.url });
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// Stripe Webhooks to Verify Paymets Action: /stripe

export const stripeWebhooks = async (request, response) => {
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers["stripe-signature"];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        console.error(`Webhook Error: ${error.message}`);
        return response.status(400).send(`Webhook Error: ${error.message}`);
    }

    // Handle the event
    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object;
            const { orderId, userId } = session.metadata;

            // Mark Payment as Paid
            await Order.findByIdAndUpdate(orderId, { isPaid: true });

            // Clear user cart
            await User.findByIdAndUpdate(userId, { cartItems: {} });

            break;
        }

        case "checkout.session.expired": {
            const session = event.data.object;
            const { orderId } = session.metadata;

            if (orderId) {
                await Order.findByIdAndDelete(orderId);
            }
            break;
        }
        default:
            console.error(`Unhandled event type ${event.type}`);
            break;
    }
    response.json({ received: true });
}


// Get Orders by User ID : /api/order/user
export const getUserOrders = async (req, res) => {
    try {
        const userId = req.userId;
        const orders = await Order.find({
            userId: userId.toString(),
        }).populate("items.product address").sort({ createdAt: -1 });

        res.json({ success: true, orders });
    }
    catch (error) {
        res.json({ success: false, message: error.message });
    }
};


// Get ALL Orders (for seller/admin) : /api/order/seller
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            status: { $ne: "Cancelled" },
        }).populate("items.product address").sort({ createdAt: -1 });
        res.json({ success: true, orders });
    }
    catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Cancel Order : /api/order/cancel
export const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.userId;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        if (order.userId !== userId) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        if (order.status !== "Order Placed") {
            return res.json({ success: false, message: "Order cannot be cancelled now" });
        }

        order.status = "Cancelled";
        await order.save();

        res.json({ success: true, message: "Order cancelled successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update Order Status : /api/order/status
export const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        if (order.status === "Delivered" || order.status === "Cancelled") {
            return res.json({ success: false, message: `Cannot update status for ${order.status} order` });
        }

        order.status = status;
        await order.save();

        res.json({ success: true, message: "Status Updated Successfully" });
    }
    catch (error) {
        res.json({ success: false, message: error.message });
    }
};
