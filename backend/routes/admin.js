const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { authenticateAdmin } = require('../middleware/authMiddleware');

router.get('/stats', authenticateAdmin, async (req, res) => {
    try {
        const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
        const { count: clubCount } = await supabase.from('clubs').select('*', { count: 'exact', head: true });
        const { count: eventCount } = await supabase.from('events').select('*', { count: 'exact', head: true });
        
        const { data: orders } = await supabase.from('orders').select('platform_fee_inr').eq('status', 'SUCCESS');
        const totalRevenue = orders ? orders.reduce((sum, order) => sum + (order.platform_fee_inr || 0), 0) : 0;

        res.json({
            users: userCount || 0,
            clubs: clubCount || 0,
            events: eventCount || 0,
            revenue: totalRevenue
        });
    } catch (err) {
        console.error("Admin stats error:", err);
        res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
});

router.get('/users', authenticateAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, name, email, role, created_at')
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.get('/clubs', authenticateAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('clubs')
            .select('*, users(name, email)')
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch clubs' });
    }
});

router.delete('/clubs/:id', authenticateAdmin, async (req, res) => {
    try {
        const { error } = await supabase.from('clubs').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ message: 'Club permanently removed.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete club' });
    }
});

module.exports = router;
