const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { authenticateToken } = require('../middleware/authMiddleware');

// Get all comments for an event (public)
router.get('/event/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;
        const { data: comments, error } = await supabase
            .from('event_comments')
            .select(`
                id,
                content,
                created_at,
                updated_at,
                users:user_id (
                    id,
                    name,
                    email
                )
            `)
            .eq('event_id', eventId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.json(comments);
    } catch (err) {
        console.error('Fetch comments error:', err);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

// Post a new comment on an event
router.post('/event/:eventId', authenticateToken, async (req, res) => {
    try {
        const { eventId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: 'Comment cannot be empty' });
        }
        if (content.trim().length > 1000) {
            return res.status(400).json({ error: 'Comment must be 1000 characters or less' });
        }

        // Verify event exists
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('id')
            .eq('id', eventId)
            .single();

        if (eventError || !event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const { data: comment, error: insertError } = await supabase
            .from('event_comments')
            .insert([{ event_id: eventId, user_id: userId, content: content.trim() }])
            .select(`
                id,
                content,
                created_at,
                updated_at,
                users:user_id (
                    id,
                    name,
                    email
                )
            `)
            .single();

        if (insertError) throw insertError;
        res.status(201).json(comment);
    } catch (err) {
        console.error('Create comment error:', err);
        res.status(500).json({ error: 'Failed to post comment' });
    }
});

// Edit own comment
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: 'Comment cannot be empty' });
        }
        if (content.trim().length > 1000) {
            return res.status(400).json({ error: 'Comment must be 1000 characters or less' });
        }

        // Verify ownership
        const { data: existing, error: fetchError } = await supabase
            .from('event_comments')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError || !existing) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        if (existing.user_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'You can only edit your own comments' });
        }

        const { data: updated, error: updateError } = await supabase
            .from('event_comments')
            .update({ content: content.trim(), updated_at: new Date().toISOString() })
            .eq('id', id)
            .select(`
                id,
                content,
                created_at,
                updated_at,
                users:user_id (
                    id,
                    name,
                    email
                )
            `)
            .single();

        if (updateError) throw updateError;
        res.json(updated);
    } catch (err) {
        console.error('Update comment error:', err);
        res.status(500).json({ error: 'Failed to update comment' });
    }
});

// Delete own comment (or admin)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verify ownership
        const { data: existing, error: fetchError } = await supabase
            .from('event_comments')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError || !existing) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        if (existing.user_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'You can only delete your own comments' });
        }

        const { error: deleteError } = await supabase
            .from('event_comments')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;
        res.json({ message: 'Comment deleted' });
    } catch (err) {
        console.error('Delete comment error:', err);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

module.exports = router;
