const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { authenticateToken } = require('../middleware/authMiddleware');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post('/create-order', authenticateToken, async (req, res) => {
    try {
        const { ticketId, quantity } = req.body;

        if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 10) {
            return res.status(400).json({ error: 'Invalid quantity' });
        }

        const { data: ticket, error: ticketError } = await supabase
            .from('tickets')
            .select('*')
            .eq('id', ticketId)
            .single();

        if (ticketError || !ticket) return res.status(404).json({ error: 'Ticket not found' });

        if (ticket.sold + quantity > ticket.capacity) {
            return res.status(400).json({ error: 'Not enough tickets available' });
        }

        const baseTotal = ticket.price_inr * quantity;
        const platformFee = baseTotal * 0.05;
        const finalTotal = baseTotal + platformFee;

        const options = {
            amount: Math.round(finalTotal * 100),
            currency: "INR",
            receipt: `receipt_ticket_${ticketId}_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        const { data: orderRecord, error: orderError } = await supabase
            .from('orders')
            .insert([{
                user_id: req.user.id,
                ticket_id: ticketId,
                quantity: quantity,
                total_amount_inr: finalTotal,
                platform_fee_inr: platformFee,
                payment_id: order.id,
                status: 'PENDING'
            }])
            .select()
            .single();

        if (orderError) throw orderError;

        res.json({
            orderId: order.id,
            amount: options.amount,
            currency: options.currency,
            dbOrderId: orderRecord.id
        });
    } catch (err) {
        console.error("Create order error:", err);
        res.status(500).json({ error: 'Failed to create payment order' });
    }
});

router.post('/verify', authenticateToken, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId, registration } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // Securely find the order and verify ownership
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .select('*')
                .eq('payment_id', razorpay_order_id)
                .single();

            if (orderError || !order || order.user_id !== req.user.id) {
                return res.status(403).json({ error: "Unauthorized or invalid order" });
            }

            // Update order status and set razorpay_payment_id
            await supabase
                .from('orders')
                .update({ status: 'SUCCESS', razorpay_payment_id: razorpay_payment_id })
                .eq('id', order.id);

            // Insert event registration record
            if (registration) {
                const { error: regError } = await supabase
                    .from('event_registrations')
                    .insert([{
                        order_id: order.id,
                        event_id: registration.eventId,
                        user_id: req.user.id,
                        attendee_name: registration.attendeeName,
                        phone: registration.phone,
                        college_id: registration.collegeId || null,
                        dietary_preference: registration.dietaryPref || null
                    }]);

                if (regError) console.error("Error saving event registration:", regError);
            }

            // Increment ticket sold count
            const { data: ticket } = await supabase
                .from('tickets')
                .select('sold')
                .eq('id', order.ticket_id)
                .single();

            if (ticket) {
                await supabase
                    .from('tickets')
                    .update({ sold: ticket.sold + order.quantity })
                    .eq('id', order.ticket_id);
            }

            // Send Email Ticket
            try {
                // We need the user's email and name, and ticket details
                const { data: userData } = await supabase.from('users').select('email, name').eq('id', req.user.id).single();
                const { data: ticketData } = await supabase.from('tickets').select('*').eq('id', order.ticket_id).single();

                if (userData && ticketData) {
                    const { sendTicketEmail } = require('../utils/email');
                    await sendTicketEmail(userData.email, userData.name, ticketData, order);
                }
            } catch (emailErr) {
                console.error("Failed to trigger ticket email:", emailErr);
                // We don't fail the payment verification if the email fails
            }

            res.json({ message: "Payment verified successfully" });
        } else {
            // Failed signature, update by razorpay_order_id securely
            await supabase
                .from('orders')
                .update({ status: 'FAILED' })
                .eq('payment_id', razorpay_order_id);

            res.status(400).json({ error: "Invalid signature sent!" });
        }
    } catch (err) {
        console.error("Verify payment error:", err);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
});

module.exports = router;
