const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { authenticateToken } = require('../middleware/authMiddleware');

// Get current user's own clubs
router.get('/clubs', authenticateToken, async (req, res) => {
    try {
        const { data: clubs, error } = await supabase
            .from('clubs')
            .select('*')
            .eq('user_id', req.user.id)
            .order('name', { ascending: true });
            
        if (error) throw error;
        
        const mappedClubs = clubs.map(c => ({
            id: c.id,
            name: c.name,
            category: c.category,
            description: c.description,
            location: c.location,
            contactInfo: c.contact_info,
            imageUrl: c.image_url,
            establishedYear: c.established_year,
            googleMapsUrl: c.google_maps_url,
            isVerified: c.is_verified,
            createdAt: c.created_at
        }));
        
        res.json(mappedClubs);
    } catch (err) {
        console.error("Get user clubs error:", err);
        res.status(500).json({ error: 'Failed to fetch user clubs' });
    }
});

// Get current user's own events
router.get('/events', authenticateToken, async (req, res) => {
    try {
        const { data: events, error } = await supabase
            .from('events')
            .select('*, clubs(name), tickets(id, name, price_inr, capacity, sold)')
            .eq('user_id', req.user.id)
            .order('date', { ascending: true });
            
        if (error) throw error;
        res.json(events);
    } catch (err) {
        console.error("Get user events error:", err);
        res.status(500).json({ error: 'Failed to fetch user events' });
    }
});

// Get current user's profile
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, role, created_at')
            .eq('id', req.user.id)
            .single();

        if (error || !user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Delete own account
router.delete('/me', authenticateToken, async (req, res) => {
    try {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', req.user.id);

        if (error) throw error;
        res.json({ message: 'Account deleted successfully.' });
    } catch (err) {
        console.error("Delete account error:", err);
        res.status(500).json({ error: 'Failed to delete account' });
    }
});

module.exports = router;
