import transporter from '../configs/emailConfig.js';

export const sendOrderConfirmationEmail = async (userEmail, userName, orderId, items, totalAmount) => {
    try {
        const itemsHtml = items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.productName}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
            </tr>
        `).join('');

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: userEmail,
            subject: `Order Confirmed - Order #${orderId}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #2c3e50; text-align: center;">Order Confirmed!</h2>
                    <p>Hi ${userName},</p>
                    <p>Thank you for your order! We've received your order and are processing it.</p>
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Order Details</h3>
                        <p><strong>Order ID:</strong> ${orderId}</p>
                        <p><strong>Payment Type:</strong> Cash on Delivery (COD)</p>
                    </div>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #eee;">
                                <th style="padding: 10px; text-align: left;">Item</th>
                                <th style="padding: 10px; text-align: center;">Qty</th>
                                <th style="padding: 10px; text-align: right;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                    <div style="text-align: right; margin-top: 20px; font-size: 1.2em; font-weight: bold;">
                        Total: $${totalAmount.toFixed(2)}
                    </div>
                    <p style="margin-top: 30px; font-size: 0.9em; color: #777; text-align: center;">
                        If you have any questions, please contact our support.
                    </p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Order confirmation email sent to ${userEmail}`);
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
    }
};

export const sendStatusUpdateEmail = async (userEmail, userName, orderId, status, cancelledBy = "seller") => {
    try {
        let statusMessage = `Your order status has been updated to: <strong>${status}</strong>.`;
        let subject = `Order Update - Order #${orderId}`;

        if (status === "Cancelled") {
            if (cancelledBy === "user") {
                statusMessage = `Your order <strong>#${orderId}</strong> has been cancelled successfully as per your request. If this was a mistake, please place a new order.`;
            } else {
                statusMessage = `We regret to inform you that your order #${orderId} has been cancelled because the items are <strong>out of stock</strong>. We apologize for the inconvenience.`;
            }
            subject = `Order Cancelled - Order #${orderId}`;
        }

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: userEmail,
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #2c3e50; text-align: center;">Order Update</h2>
                    <p>Hi ${userName},</p>
                    <p>${statusMessage}</p>
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Order ID:</strong> ${orderId}</p>
                        <p><strong>Current Status:</strong> ${status}</p>
                    </div>
                    <p style="margin-top: 30px; font-size: 0.9em; color: #777; text-align: center;">
                        If you have any questions, please contact our support.
                    </p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Status update email sent to ${userEmail} for order ${orderId}`);
    } catch (error) {
        console.error('Error sending status update email:', error);
    }
};
