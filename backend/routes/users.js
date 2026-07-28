const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { authenticateToken } = require('../middleware/authMiddleware');

// Get current user's own clubs
router.get('/clubs', authenticateToken, async (req, res) => {
    try {
        // 1. Get clubs they own
        const { data: ownClubs, error: ownError } = await supabase
            .from('clubs')
            .select('*')
            .eq('user_id', req.user.id);
            
        if (ownError) throw ownError;
        
        // 2. Get clubs they are members of
        const { data: memberRelations, error: memberError } = await supabase
            .from('club_members')
            .select('club_id, role')
            .eq('user_id', req.user.id);
            
        if (memberError) throw memberError;
        
        let allClubs = [...ownClubs.map(c => ({ ...c, isOwner: true, role: 'owner' }))];
        
        if (memberRelations && memberRelations.length > 0) {
            const memberClubIds = memberRelations.map(mr => mr.club_id);
            const { data: memberClubs, error: mcError } = await supabase
                .from('clubs')
                .select('*')
                .in('id', memberClubIds);
                
            if (mcError) throw mcError;
            
            const formattedMemberClubs = memberClubs.map(mc => {
                const relation = memberRelations.find(r => r.club_id === mc.id);
                return {
                    ...mc,
                    isOwner: false,
                    role: relation ? relation.role : 'member'
                };
            });
            
            allClubs = [...allClubs, ...formattedMemberClubs];
        }

        const mappedClubs = allClubs.map(c => ({
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
            createdAt: c.created_at,
            isOwner: c.isOwner,
            role: c.role
        }));
        
        // Sort by name
        mappedClubs.sort((a, b) => a.name.localeCompare(b.name));
        
        res.json(mappedClubs);
    } catch (err) {
        console.error("Get user clubs error:", err);
        res.status(500).json({ error: 'Failed to fetch user clubs' });
    }
});

// Get current user's own events
router.get('/events', authenticateToken, async (req, res) => {
    try {
        // 1. Get clubs they own
        const { data: ownClubs } = await supabase
            .from('clubs')
            .select('id')
            .eq('user_id', req.user.id);
            
        // 2. Get clubs they are members of
        const { data: memberClubs } = await supabase
            .from('club_members')
            .select('club_id')
            .eq('user_id', req.user.id);
            
        const clubIds = [
            ...(ownClubs || []).map(c => c.id),
            ...(memberClubs || []).map(c => c.club_id)
        ];
        
        let query = supabase
            .from('events')
            .select('*, clubs(name), tickets(id, name, price_inr, capacity, sold)');
            
        if (clubIds.length > 0) {
            query = query.or(`user_id.eq.${req.user.id},club_id.in.(${clubIds.join(',')})`);
        } else {
            query = query.eq('user_id', req.user.id);
        }
        
        const { data: events, error } = await query.order('date', { ascending: true });
        
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


// Get current user's RSVP'd tickets
router.get('/tickets', authenticateToken, async (req, res) => {
    try {
        const { data: tickets, error } = await supabase
            .from('event_registrations')
            .select('id, attendee_name, created_at, events(id, title, date, location, image_url, clubs(name))')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(tickets);
    } catch (err) {
        console.error("Get user tickets error:", err);
        res.status(500).json({ error: 'Failed to fetch user tickets' });
    }
});

module.exports = router;
