const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validateEventInput } = require('../middleware/validationMiddleware');

router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*, clubs(name)')
            .order('date', { ascending: true });
        
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id/tickets', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('tickets')
            .select('*')
            .eq('event_id', req.params.id);
        
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

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
        res.status(201).json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

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
        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        console.error("Delete event error:", err);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

module.exports = router;
