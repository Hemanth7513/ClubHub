const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { requireRole } = require('../middleware/authMiddleware');
const { securityLog, SECURITY_EVENTS } = require('../utils/logger');

// Check 9 (RBAC): All admin routes protected server-side via requireRole('admin').
// A hidden button in the UI is NOT security — the server enforces it here.
const adminOnly = requireRole('admin');

router.get('/stats', ...adminOnly, async (req, res) => {
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

router.get('/users', ...adminOnly, async (req, res) => {
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

router.get('/clubs', ...adminOnly, async (req, res) => {
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

router.delete('/clubs/:id', ...adminOnly, async (req, res) => {
    try {
        securityLog(SECURITY_EVENTS.ADMIN_ACTION, { userId: req.user.id, action: 'delete_club', resource: req.params.id }, req);
        const { error } = await supabase.from('clubs').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ message: 'Club permanently removed.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete club' });
    }
});

router.put('/clubs/:id/verify', ...adminOnly, async (req, res) => {
    try {
        const { is_verified } = req.body;
        securityLog(SECURITY_EVENTS.ADMIN_ACTION, { userId: req.user.id, action: 'verify_club', resource: req.params.id }, req);
        const { data, error } = await supabase
            .from('clubs')
            .update({ is_verified })
            .eq('id', req.params.id)
            .select()
            .single();
        if (error) throw error;
        res.json({ message: 'Club verification updated.', club: data });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update club verification' });
    }
});

router.get('/events', ...adminOnly, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*, clubs(name), users(name, email)')
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

router.delete('/events/:id', ...adminOnly, async (req, res) => {
    try {
        securityLog(SECURITY_EVENTS.ADMIN_ACTION, { userId: req.user.id, action: 'delete_event', resource: req.params.id }, req);
        const { error } = await supabase.from('events').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ message: 'Event permanently removed.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

module.exports = router;
