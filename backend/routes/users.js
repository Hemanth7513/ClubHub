const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { authenticateToken } = require('../middleware/authMiddleware');

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
            createdAt: c.created_at
        }));
        
        res.json(mappedClubs);
    } catch (err) {
        console.error("Get user clubs error:", err);
        res.status(500).json({ error: 'Failed to fetch user clubs' });
    }
});

router.get('/events', authenticateToken, async (req, res) => {
    try {
        const { data: events, error } = await supabase
            .from('events')
            .select('*, clubs(name)')
            .eq('user_id', req.user.id)
            .order('date', { ascending: true });
            
        if (error) throw error;
        res.json(events);
    } catch (err) {
        console.error("Get user events error:", err);
        res.status(500).json({ error: 'Failed to fetch user events' });
    }
});

module.exports = router;
