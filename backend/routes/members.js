const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { authenticateToken } = require('../middleware/authMiddleware');

// Helper to check if user is the owner or admin
const isOwnerOrAdmin = async (clubId, userId, userRole) => {
    if (userRole === 'admin') return true;
    const { data: club } = await supabase
        .from('clubs')
        .select('user_id')
        .eq('id', clubId)
        .single();
    return club && club.user_id === userId;
};

// Get all members of a club
router.get('/club/:clubId', authenticateToken, async (req, res) => {
    try {
        const { clubId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Only owners or admin can view members list
        const authorized = await isOwnerOrAdmin(clubId, userId, userRole);
        if (!authorized) {
            return res.status(403).json({ error: 'Only the club owner or admin can view team members' });
        }

        const { data: members, error } = await supabase
            .from('club_members')
            .select(`
                id,
                role,
                created_at,
                users:user_id (
                    id,
                    email,
                    name,
                    profiles:user_id (
                        avatar_url
                    )
                )
            `)
            .eq('club_id', clubId);

        if (error) throw error;
        res.json(members);
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ error: 'Failed to fetch members' });
    }
});

// Add a member by email
router.post('/club/:clubId', authenticateToken, async (req, res) => {
    try {
        const { clubId } = req.params;
        const { email, role } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        if (!email || !role) {
            return res.status(400).json({ error: 'Email and role are required' });
        }

        if (!['editor', 'moderator'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // Only owners or admin can add members
        const authorized = await isOwnerOrAdmin(clubId, userId, userRole);
        if (!authorized) {
            return res.status(403).json({ error: 'Only the club owner or admin can manage team members' });
        }

        // Find user by email
        const { data: targetUser, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (userError || !targetUser) {
            return res.status(404).json({ error: 'User not found in the system' });
        }

        // Add user to club_members
        const { data: newMember, error: insertError } = await supabase
            .from('club_members')
            .insert([{ club_id: clubId, user_id: targetUser.id, role }])
            .select(`
                id,
                role,
                created_at,
                users:user_id (
                    id,
                    email,
                    name,
                    profiles:user_id (
                        avatar_url
                    )
                )
            `)
            .single();

        if (insertError) {
            if (insertError.code === '23505') {
                return res.status(400).json({ error: 'User is already a member of this club' });
            }
            throw insertError;
        }

        res.status(201).json(newMember);
    } catch (error) {
        console.error('Error adding member:', error);
        res.status(500).json({ error: 'Failed to add member' });
    }
});

// Update a member's role
router.put('/:memberId', authenticateToken, async (req, res) => {
    try {
        const { memberId } = req.params;
        const { role } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        if (!role || !['editor', 'moderator'].includes(role)) {
            return res.status(400).json({ error: 'Valid role is required' });
        }

        // Fetch club of the member
        const { data: member, error: memberError } = await supabase
            .from('club_members')
            .select('club_id')
            .eq('id', memberId)
            .single();

        if (memberError || !member) {
            return res.status(404).json({ error: 'Member record not found' });
        }

        // Only owners or admin can update roles
        const authorized = await isOwnerOrAdmin(member.club_id, userId, userRole);
        if (!authorized) {
            return res.status(403).json({ error: 'Only the club owner or admin can update roles' });
        }

        const { data: updatedMember, error: updateError } = await supabase
            .from('club_members')
            .update({ role })
            .eq('id', memberId)
            .select(`
                id,
                role,
                created_at,
                users:user_id (
                    id,
                    email,
                    name,
                    profiles:user_id (
                        avatar_url
                    )
                )
            `)
            .single();

        if (updateError) throw updateError;
        res.json(updatedMember);
    } catch (error) {
        console.error('Error updating member:', error);
        res.status(500).json({ error: 'Failed to update member' });
    }
});

// Delete a member
router.delete('/:memberId', authenticateToken, async (req, res) => {
    try {
        const { memberId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Fetch club of the member
        const { data: member, error: memberError } = await supabase
            .from('club_members')
            .select('club_id')
            .eq('id', memberId)
            .single();

        if (memberError || !member) {
            return res.status(404).json({ error: 'Member record not found' });
        }

        // Only owners or admin can delete members
        const authorized = await isOwnerOrAdmin(member.club_id, userId, userRole);
        if (!authorized) {
            return res.status(403).json({ error: 'Only the club owner or admin can remove team members' });
        }

        const { error: deleteError } = await supabase
            .from('club_members')
            .delete()
            .eq('id', memberId);

        if (deleteError) throw deleteError;
        res.json({ message: 'Member removed successfully' });
    } catch (error) {
        console.error('Error removing member:', error);
        res.status(500).json({ error: 'Failed to remove member' });
    }
});

module.exports = router;
