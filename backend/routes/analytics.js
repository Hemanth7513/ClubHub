const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { authenticateToken } = require('../middleware/authMiddleware');

const hasClubPermission = async (userId, clubId) => {
    const { data: club } = await supabase.from('clubs').select('user_id').eq('id', clubId).single();
    if (club && club.user_id === userId) return true;

    const { data: member } = await supabase.from('club_members')
        .select('role')
        .eq('club_id', clubId)
        .eq('user_id', userId)
        .single();
    return !!member;
};

// POST /api/analytics/club/:id/view - Record a page view
router.post('/club/:id/view', async (req, res) => {
    try {
        const clubId = req.params.id;
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // UPSERT analytics record for today
        const { data, error } = await supabase.rpc('increment_club_view', {
            p_club_id: parseInt(clubId),
            p_view_date: today
        });

        // Fallback if RPC doesn't exist: manually fetch and update
        if (error && error.code === '42883') {
            // Check if record exists
            const { data: existing } = await supabase
                .from('club_analytics')
                .select('*')
                .eq('club_id', clubId)
                .eq('view_date', today)
                .single();
            
            if (existing) {
                await supabase
                    .from('club_analytics')
                    .update({ page_views: existing.page_views + 1 })
                    .eq('id', existing.id);
            } else {
                await supabase
                    .from('club_analytics')
                    .insert([{ club_id: clubId, view_date: today, page_views: 1 }]);
            }
        } else if (error) {
            throw error;
        }

        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Analytics track error:', err);
        res.status(500).json({ error: 'Failed to record view' });
    }
});

// GET /api/analytics/club/:id - Get analytics data (requires club ownership/permission)
router.get('/club/:id', authenticateToken, async (req, res) => {
    try {
        const clubId = req.params.id;
        
        // Verify permissions
        const hasPerm = await hasClubPermission(req.user.id, clubId);
        if (!hasPerm && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to view analytics for this club' });
        }

        // Get view stats for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: views, error: viewsError } = await supabase
            .from('club_analytics')
            .select('view_date, page_views')
            .eq('club_id', clubId)
            .gte('view_date', thirtyDaysAgo.toISOString().split('T')[0])
            .order('view_date', { ascending: true });
            
        if (viewsError) throw viewsError;

        // Get total follower count
        const { count: followersCount, error: followersError } = await supabase
            .from('club_followers')
            .select('*', { count: 'exact', head: true })
            .eq('club_id', clubId);
            
        if (followersError) throw followersError;
        
        // Get total events count
        const { count: eventsCount, error: eventsError } = await supabase
            .from('events')
            .select('*', { count: 'exact', head: true })
            .eq('club_id', clubId);
            
        if (eventsError) throw eventsError;

        res.json({
            views: views || [],
            totalFollowers: followersCount || 0,
            totalEvents: eventsCount || 0
        });
    } catch (err) {
        console.error('Fetch analytics error:', err);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

module.exports = router;
