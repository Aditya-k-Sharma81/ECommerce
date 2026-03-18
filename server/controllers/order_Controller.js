import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Stripe from 'stripe';
import User from '../models/User.js';
import { sendOrderConfirmationEmail, sendStatusUpdateEmail } from "../utils/emailService.js";

// Place Order COD : /api/order/cod
export const placeOrderCOD = async (req, res) => {
    try {
        const { items, address } = req.body;
        const userId = req.userId;

        if (!address || items.length === 0) {
            return res.json({ success: false, message: "Invalid data" });
        }

        // Fetch User for email
        const user = await User.findById(userId);

        // calculate amount Using Items and collect item details for email
        let amount = 0;
        let emailItems = [];

        for (const item of items) {
            const product = await Product.findById(item.product);
            const itemTotal = product.offerPrice * item.quantity;
            amount += itemTotal;
            emailItems.push({
                productName: product.name,
                quantity: item.quantity,
                price: product.offerPrice
            });
        }

        const deliveryCharge = Math.floor(amount * 0.02);
        amount += deliveryCharge;

        const order = await Order.create({
            userId, items, amount, address, paymentType: "COD"
        })

        // Clear user cart
        await User.findByIdAndUpdate(userId, { cartItems: {} });

        // Send confirmation email
        if (user && user.email) {
            await sendOrderConfirmationEmail(user.email, user.name, order._id, emailItems, amount);
        }

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

    console.log("Stripe Webhook received");

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET === "") {
            // If secret is missing, we try to parse it directly in development (NOT SECURE FOR PRODUCTION)
            if (process.env.NODE_ENV === 'development') {
                console.warn("⚠️ STRIPE_WEBHOOK_SECRET is missing. Bypassing signature check for development.");
                event = JSON.parse(request.body.toString());
            } else {
                throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
            }
        } else {
            event = stripeInstance.webhooks.constructEvent(
                request.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        }
    } catch (error) {
        console.error(`❌ Webhook Error: ${error.message}`);
        return response.status(400).send(`Webhook Error: ${error.message}`);
    }

    console.log(`Event Type: ${event.type}`);

    // Handle the event
    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object;
            const { orderId, userId } = session.metadata;

            console.log(`Processing completed checkout for Order: ${orderId}, User: ${userId}`);

            // Fetch order first to check if already paid (prevent duplicate emails)
            const existingOrder = await Order.findById(orderId);
            if (!existingOrder) {
                console.error(`❌ Order ${orderId} not found in database.`);
                break;
            }
            if (existingOrder.isPaid) {
                console.log(`ℹ️ Order ${orderId} already marked as paid.`);
                break;
            }

            // Mark Payment as Paid
            const order = await Order.findByIdAndUpdate(orderId, { isPaid: true }, { new: true }).populate("items.product");

            // Clear user cart
            const user = await User.findByIdAndUpdate(userId, { cartItems: {} }, { new: true });

            console.log(`User found: ${user ? user.email : 'No'} | Order items: ${order ? order.items.length : 0}`);

            // Send confirmation email
            if (user && user.email && order) {
                const emailItems = order.items.map(item => ({
                    productName: item.product ? item.product.name : "Vegetable Item",
                    quantity: item.quantity,
                    price: item.product ? item.product.offerPrice : 0
                }));

                console.log("📧 Attempting to send online order confirmation email...");
                await sendOrderConfirmationEmail(user.email, user.name, orderId, emailItems, order.amount);
            } else {
                console.error("❌ Could not send email: User or Order data missing during webhook.");
            }

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

        // Send cancellation email to user (self-cancelled)
        const user = await User.findById(userId);
        if (user && user.email) {
            await sendStatusUpdateEmail(user.email, user.name, orderId, "Cancelled", "user");
        }

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

        // Send status update email
        const user = await User.findById(order.userId);
        if (user && user.email) {
            sendStatusUpdateEmail(user.email, user.name, orderId, status);
        }

        res.json({ success: true, message: "Status Updated Successfully" });
    }
    catch (error) {
        res.json({ success: false, message: error.message });
    }
};
