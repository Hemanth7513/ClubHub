const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { authenticateToken } = require('../middleware/authMiddleware');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_clubhub123',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_clubhub123',
});

router.post('/create-order', authenticateToken, async (req, res) => {
    try {
        const { ticketId, quantity } = req.body;

        const { data: ticket, error: ticketError } = await supabase
            .from('tickets')
            .select('*')
            .eq('id', ticketId)
            .single();

        if (ticketError || !ticket) return res.status(404).json({ error: 'Ticket not found' });
        
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
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'secret_clubhub123')
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            const { error: updateError } = await supabase
                .from('orders')
                .update({ status: 'SUCCESS' })
                .eq('id', dbOrderId);

            if (updateError) throw updateError;
            
            res.json({ message: "Payment verified successfully" });
        } else {
            await supabase
                .from('orders')
                .update({ status: 'FAILED' })
                .eq('id', dbOrderId);
                
            res.status(400).json({ error: "Invalid signature sent!" });
        }
    } catch (err) {
        console.error("Verify payment error:", err);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
});

module.exports = router;
