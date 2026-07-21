const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { authenticateToken } = require('../middleware/authMiddleware');

// Razorpay temporarily removed as requested. 
// const Razorpay = require('razorpay');
// const crypto = require('crypto');

/* 
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
*/

router.post('/create-order', authenticateToken, async (req, res) => {
    try {
        // Mock order creation for now since Razorpay is removed
        res.json({
            orderId: 'mock_order_123',
            amount: 50000,
            currency: 'INR',
            dbOrderId: 'mock_db_order'
        });
    } catch (err) {
        console.error("Create order error:", err);
        res.status(500).json({ error: 'Failed to create payment order' });
    }
});

router.post('/verify', authenticateToken, async (req, res) => {
    try {
        // Mock verification for now since Razorpay is removed
        res.json({ message: "Payment verified successfully (Mock)" });
    } catch (err) {
        console.error("Verify payment error:", err);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
});

module.exports = router;
