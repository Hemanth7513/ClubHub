const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validateEventInput } = require('../middleware/validationMiddleware');

const NodeCache = require('node-cache');
const myCache = new NodeCache({ stdTTL: 120 });

// Get all events
router.get('/', async (req, res) => {
    try {
        const cachedData = myCache.get('events_all');
        if (cachedData) return res.json(cachedData);

        const { data, error } = await supabase
            .from('events')
            .select('*, clubs(name)')
            .order('date', { ascending: true });
        
        if (error) throw error;
        myCache.set('events_all', data);
        res.json(data);
    } catch (err) {
        console.error('Fetch events error:', err);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// Get single event
router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*, clubs(id, name)')
            .eq('id', req.params.id)
            .single();

        if (error || !data) return res.status(404).json({ error: 'Event not found' });
        res.json(data);
    } catch (err) {
        console.error('Fetch single event error:', err);
        res.status(500).json({ error: 'Failed to fetch event' });
    }
});

// Get tickets for an event
router.get('/:id/tickets', async (req, res) => {
    try {
        const cacheKey = `tickets_${req.params.id}`;
        const cachedData = myCache.get(cacheKey);
        if (cachedData) return res.json(cachedData);

        const { data, error } = await supabase
            .from('tickets')
            .select('*')
            .eq('event_id', req.params.id);
        
        if (error) throw error;
        myCache.set(cacheKey, data);
        res.json(data);
    } catch (err) {
        console.error('Fetch tickets error:', err);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
});

// Create a new event
router.post('/', authenticateToken, validateEventInput, async (req, res) => {
    const { clubId, title, description, date, location, imageUrl, category } = req.body;
    try {
        const { data, error } = await supabase
            .from('events')
            .insert([{
                club_id: clubId, title, description, date, location, 
                image_url: imageUrl, category,
                user_id: req.user.id
            }])
            .select();
        
        if (error) throw error;
        myCache.flushAll();
        res.status(201).json(data[0]);
    } catch (err) {
        console.error('Create event error:', err);
        res.status(500).json({ error: 'Failed to create event' });
    }
});

// Create a ticket for an event (owner only)
router.post('/:id/tickets', authenticateToken, async (req, res) => {
    try {
        const { name, price_inr, capacity } = req.body;
        if (!name) return res.status(400).json({ error: 'Ticket name is required' });

        const { data, error } = await supabase
            .from('tickets')
            .insert([{
                event_id: req.params.id,
                name,
                price_inr: parseFloat(price_inr) || 0,
                capacity: parseInt(capacity) || 100,
                sold: 0
            }])
            .select()
            .single();

        if (error) throw error;
        myCache.del(`tickets_${req.params.id}`);
        res.status(201).json(data);
    } catch (err) {
        console.error('Create ticket error:', err);
        res.status(500).json({ error: 'Failed to create ticket' });
    }
});

// Update event (protected, owner only)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { data: event, error: fetchError } = await supabase
            .from('events')
            .select('user_id')
            .eq('id', req.params.id)
            .single();

        if (fetchError || !event) return res.status(404).json({ error: 'Event not found' });

        if (event.user_id && event.user_id.toString() !== req.user.id.toString()) {
            return res.status(403).json({ error: 'You are not authorized to edit this event' });
        }

        const { clubId, title, description, date, location, imageUrl, category } = req.body;

        const { data, error } = await supabase
            .from('events')
            .update({
                club_id: clubId, title, description, date, location,
                image_url: imageUrl, category
            })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        myCache.flushAll();
        res.json(data);
    } catch (err) {
        console.error('Edit event error:', err);
        res.status(500).json({ error: 'Failed to update event' });
    }
});

// Delete event (protected, owner only)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { data: event, error: fetchError } = await supabase
            .from('events')
            .select('user_id')
            .eq('id', req.params.id)
            .single();
            
        if (fetchError || !event) return res.status(404).json({ error: 'Event not found' });
        
        if (event.user_id && event.user_id.toString() !== req.user.id.toString()) {
            return res.status(403).json({ error: 'You are not authorized to delete this event' });
        }
        
        const { error: deleteError } = await supabase
            .from('events')
            .delete()
            .eq('id', req.params.id);
            
        if (deleteError) throw deleteError;
        myCache.flushAll();
        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        console.error("Delete event error:", err);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

module.exports = router;
