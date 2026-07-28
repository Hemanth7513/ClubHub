const express = require('express');
const router = express.Router();
const { supabase } = require('../supabase');
const { authenticateToken } = require('../middleware/authMiddleware');

// Get whether the current user follows a specific club
router.get('/check/:clubId', authenticateToken, async (req, res) => {
    try {
        const { clubId } = req.params;
        const user_id = req.user.id;
        
        const { data, error } = await supabase
            .from('club_followers')
            .select('*')
            .eq('club_id', clubId)
            .eq('user_id', user_id)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
            throw error;
        }

        res.json({ isFollowing: !!data });
    } catch (error) {
        console.error('Error checking follow status:', error);
        res.status(500).json({ error: 'Failed to check follow status' });
    }
});

// Follow a club
router.post('/:clubId', authenticateToken, async (req, res) => {
    try {
        const { clubId } = req.params;
        const user_id = req.user.id;

        const { error } = await supabase
            .from('club_followers')
            .insert([{ club_id: clubId, user_id }]);

        if (error) {
            if (error.code === '23505') {
                return res.status(400).json({ error: 'Already following this club' });
            }
            throw error;
        }

        res.json({ message: 'Successfully followed club' });
    } catch (error) {
        console.error('Error following club:', error);
        res.status(500).json({ error: 'Failed to follow club' });
    }
});

// Unfollow a club
router.delete('/:clubId', authenticateToken, async (req, res) => {
    try {
        const { clubId } = req.params;
        const user_id = req.user.id;

        const { error } = await supabase
            .from('club_followers')
            .delete()
            .eq('club_id', clubId)
            .eq('user_id', user_id);

        if (error) throw error;

        res.json({ message: 'Successfully unfollowed club' });
    } catch (error) {
        console.error('Error unfollowing club:', error);
        res.status(500).json({ error: 'Failed to unfollow club' });
    }
});

// Get a user's personalized event feed (events from clubs they follow)
router.get('/feed/events', authenticateToken, async (req, res) => {
    try {
        const user_id = req.user.id;

        // Get IDs of clubs the user follows
        const { data: follows, error: followsError } = await supabase
            .from('club_followers')
            .select('club_id')
            .eq('user_id', user_id);

        if (followsError) throw followsError;

        if (!follows || follows.length === 0) {
            return res.json([]); // Not following any clubs, empty feed
        }

        const clubIds = follows.map(f => f.club_id);

        // Get upcoming events from those clubs
        const now = new Date().toISOString();
        const { data: events, error: eventsError } = await supabase
            .from('events')
            .select(`
                *,
                clubs:club_id (
                    name,
                    image_url
                )
            `)
            .in('club_id', clubIds)
            .gte('date', now)
            .order('date', { ascending: true });

        if (eventsError) throw eventsError;

        res.json(events);
    } catch (error) {
        console.error('Error fetching personalized feed:', error);
        res.status(500).json({ error: 'Failed to fetch feed' });
    }
});

module.exports = router;
