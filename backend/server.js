const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const supabase = require('./supabase');

const app = express();

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api/', limiter);

// API Endpoints

// 1. Get all clubs with filtering
app.get('/api/clubs', async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = supabase.from('clubs').select('*');

        if (category) query = query.eq('category', category);
        if (search) query = query.ilike('name', `%${search}%`);

        const { data: clubs, error } = await query.order('name', { ascending: true });

        if (error) throw error;
        
        // Map to camelCase for frontend compatibility
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
        res.status(500).json({ error: 'Failed to fetch clubs' });
    }
});

// 2. Get single club details
app.get('/api/clubs/:id', async (req, res) => {
    try {
        const { data: club, error } = await supabase
            .from('clubs')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error || !club) return res.status(404).json({ error: 'Club not found' });
        
        // Map to camelCase for frontend compatibility
        const mappedClub = {
            id: club.id,
            name: club.name,
            category: club.category,
            description: club.description,
            location: club.location,
            contactInfo: club.contact_info,
            imageUrl: club.image_url,
            establishedYear: club.established_year,
            googleMapsUrl: club.google_maps_url,
            createdAt: club.created_at
        };
        
        res.json(mappedClub);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch club details' });
    }
});

// 3. Register a new club (requires basic protection)
app.post('/api/clubs', async (req, res) => {
    try {
        const { name, category, description, location, contactInfo, imageUrl, establishedYear, googleMapsUrl } = req.body;
        
        const { data, error } = await supabase
            .from('clubs')
            .insert([{
                name, category, description, location, contact_info: contactInfo, image_url: imageUrl, 
                established_year: establishedYear, google_maps_url: googleMapsUrl
            }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to add club' });
    }
});

// 4. Search suggestions
app.get('/api/search/suggestions', async (req, res) => {
    try {
        const { q } = req.query;
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`ClubHub Backend listening on port ${PORT}`);
});
