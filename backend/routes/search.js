const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

router.get('/suggestions', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);
        
        const { data, error } = await supabase
            .from('clubs')
            .select('name')
            .ilike('name', `%${q}%`)
            .limit(5);

        if (error) throw error;
        res.json(data.map(c => c.name));
    } catch (err) {
        res.status(500).json({ error: 'Search failed' });
    }
});

module.exports = router;
