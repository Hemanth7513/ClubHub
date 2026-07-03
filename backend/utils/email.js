const { Resend } = require('resend');

// Initialize Resend with the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder_key');

const sendTicketEmail = async (userEmail, userName, ticketDetails, orderDetails) => {
    try {
        if (!process.env.RESEND_API_KEY) {
            console.warn("No RESEND_API_KEY provided. Skipping email delivery.");
            return false;
        }

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">ClubHub Ticket</h1>
                </div>
                <div style="padding: 30px;">
                    <h2 style="color: #333333; margin-top: 0;">Hello ${userName || 'Member'},</h2>
                    <p style="color: #555555; font-size: 16px;">Thank you for your purchase! Your payment has been successfully processed.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #333333;">Order Summary</h3>
                        <p style="margin: 5px 0; color: #555555;"><strong>Ticket Type:</strong> ${ticketDetails.name}</p>
                        <p style="margin: 5px 0; color: #555555;"><strong>Quantity:</strong> ${orderDetails.quantity}</p>
                        <p style="margin: 5px 0; color: #555555;"><strong>Total Paid:</strong> ₹${orderDetails.total_amount_inr}</p>
                        <p style="margin: 5px 0; color: #555555;"><strong>Payment ID:</strong> ${orderDetails.razorpay_payment_id}</p>
                    </div>

                    <p style="color: #555555; font-size: 14px;">Please present this email or the Payment ID at the venue for entry.</p>
                </div>
                <div style="background-color: #f0f0f0; padding: 15px; text-align: center;">
                    <p style="color: #888888; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Vijayawada ClubHub. All rights reserved.</p>
                </div>
            </div>
        `;

        const { data, error } = await resend.emails.send({
            from: 'ClubHub Tickets <tickets@resend.dev>', // resend.dev allows testing without a custom domain!
            to: [userEmail],
            subject: `Your Ticket Confirmation: ${ticketDetails.name}`,
            html: emailHtml,
        });

        if (error) {
            console.error("Resend API Error:", error);
            return false;
        }

        console.log("Email sent successfully:", data);
        return true;
    } catch (err) {
        console.error("Failed to send email:", err);
        return false;
    }
};

const sendOtpEmail = async (userEmail, otpCode) => {
    try {
        if (!process.env.RESEND_API_KEY) {
            console.warn("No RESEND_API_KEY provided. Skipping email delivery. OTP:", otpCode);
            return true; // Return true in dev so we don't break the flow
        }

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                <div style="background-color: #1a1a1a; padding: 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">ClubHub Security</h1>
                </div>
                <div style="padding: 30px; text-align: center;">
                    <h2 style="color: #333333; margin-top: 0;">Your Login Code</h2>
                    <p style="color: #555555; font-size: 16px;">Please use the following 6-digit code to log into your account.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h1 style="margin: 0; color: #8b5cf6; font-size: 36px; letter-spacing: 5px;">${otpCode}</h1>
                    </div>

                    <p style="color: #555555; font-size: 14px;">This code will expire in 5 minutes. If you did not request this code, please ignore this email.</p>
                </div>
            </div>
        `;

        const { data, error } = await resend.emails.send({
            from: 'ClubHub Security <security@resend.dev>',
            to: [userEmail],
            subject: 'Your ClubHub Login Code',
            html: emailHtml,
        });

        if (error) {
            console.error("Resend API Error:", error);
            return false;
        }
        return true;
    } catch (err) {
        console.error("Failed to send OTP email:", err);
        return false;
    }
};

module.exports = {
    sendTicketEmail,
    sendOtpEmail
};
