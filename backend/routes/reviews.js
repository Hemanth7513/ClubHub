const express = require('express');
const router = express.Router();
const { supabase } = require('../supabase');
const { authenticateToken } = require('../middleware/authMiddleware');

// Get all reviews for a club
router.get('/club/:clubId', async (req, res) => {
    try {
        const { clubId } = req.params;
        
        const { data: reviews, error } = await supabase
            .from('reviews')
            .select(`
                *,
                users:user_id (
                    name,
                    profiles:user_id (
                        avatar_url
                    )
                )
            `)
            .eq('club_id', clubId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// Create a review
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { club_id, rating, comment } = req.body;
        const user_id = req.user.id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        // Insert new review
        const { data: newReview, error } = await supabase
            .from('reviews')
            .insert([{
                club_id,
                user_id,
                rating,
                comment
            }])
            .select(`
                *,
                users:user_id (
                    name,
                    profiles:user_id (
                        avatar_url
                    )
                )
            `)
            .single();

        if (error) {
            // Supabase unique constraint violation error code is 23505
            if (error.code === '23505') {
                return res.status(400).json({ error: 'You have already reviewed this club' });
            }
            throw error;
        }

        res.status(201).json(newReview);
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ error: 'Failed to create review' });
    }
});

// Update a review
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const user_id = req.user.id;

        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const { data: review, error } = await supabase
            .from('reviews')
            .update({ rating, comment })
            .eq('id', id)
            .eq('user_id', user_id)
            .select()
            .single();

        if (error) throw error;
        if (!review) return res.status(404).json({ error: 'Review not found or unauthorized' });

        res.json(review);
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ error: 'Failed to update review' });
    }
});

// Delete a review
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', id)
            .eq('user_id', user_id);

        if (error) throw error;

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Failed to delete review' });
    }
});

module.exports = router;
