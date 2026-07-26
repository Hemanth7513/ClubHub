const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validateClubInput } = require('../middleware/validationMiddleware');
const NodeGeocoder = require('node-geocoder');
const NodeCache = require('node-cache');

// Cache for 2 minutes (120 seconds)
const myCache = new NodeCache({ stdTTL: 120 });

const geocoder = NodeGeocoder({
  provider: 'openstreetmap'
});

// Get all clubs
router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query;
        
        // Use cache key based on query params
        const cacheKey = `clubs_${category || 'all'}_${search || 'all'}`;
        const cachedData = myCache.get(cacheKey);
        
        if (cachedData) {
            return res.json(cachedData);
        }

        let query = supabase.from('clubs').select('*');

        if (category) query = query.eq('category', category);
        if (search) query = query.ilike('name', `%${search}%`);

        const { data: clubs, error } = await query.order('name', { ascending: true });

        if (error) throw error;
        
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
            latitude: c.latitude,
            longitude: c.longitude,
            isVerified: c.is_verified,
            userId: c.user_id,
            createdAt: c.created_at
        }));
        
        myCache.set(cacheKey, mappedClubs);
        res.json(mappedClubs);
    } catch (err) {
        console.error("Fetch clubs error:", err);
        res.status(500).json({ error: 'Failed to fetch clubs' });
    }
});

// Get single club details
router.get('/:id', async (req, res) => {
    try {
        const { data: club, error } = await supabase
            .from('clubs')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error || !club) return res.status(404).json({ error: 'Club not found' });
        
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
            latitude: club.latitude,
            longitude: club.longitude,
            isVerified: club.is_verified,
            userId: club.user_id,
            createdAt: club.created_at
        };
        
        res.json(mappedClub);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch club details' });
    }
});

// Register a new club
router.post('/', authenticateToken, validateClubInput, async (req, res) => {
    try {
        const { name, category, description, location, contactInfo, imageUrl, establishedYear, googleMapsUrl } = req.body;
        
        let latitude = null;
        let longitude = null;
        if (location) {
            try {
                const geoRes = await geocoder.geocode(location);
                if (geoRes.length > 0) {
                    latitude = geoRes[0].latitude;
                    longitude = geoRes[0].longitude;
                }
            } catch (err) {
                console.error("Geocoding failed:", err);
            }
        }
        
        const { data, error } = await supabase
            .from('clubs')
            .insert([{
                name, category, description, location, contact_info: contactInfo, image_url: imageUrl, 
                established_year: establishedYear, google_maps_url: googleMapsUrl,
                latitude, longitude,
                user_id: req.user.id
            }])
            .select();

        if (error) throw error;
        myCache.flushAll();
        res.status(201).json(data[0]);
    } catch (err) {
        console.error("Add club error:", err);
        res.status(500).json({ error: 'Failed to add club' });
    }
});

// Update club (protected, owner only)
router.put('/:id', authenticateToken, validateClubInput, async (req, res) => {
    try {
        const { data: club, error: fetchError } = await supabase
            .from('clubs')
            .select('user_id')
            .eq('id', req.params.id)
            .single();

        if (fetchError || !club) return res.status(404).json({ error: 'Club not found' });

        if (club.user_id && club.user_id.toString() !== req.user.id.toString()) {
            return res.status(403).json({ error: 'You are not authorized to edit this club' });
        }

        const { name, category, description, location, contactInfo, imageUrl, establishedYear, googleMapsUrl } = req.body;

        let latitude = null;
        let longitude = null;
        if (location) {
            try {
                const geoRes = await geocoder.geocode(location);
                if (geoRes.length > 0) {
                    latitude = geoRes[0].latitude;
                    longitude = geoRes[0].longitude;
                }
            } catch (err) {
                console.error("Geocoding failed:", err);
            }
        }

        const { data, error } = await supabase
            .from('clubs')
            .update({
                name, category, description, location,
                contact_info: contactInfo, image_url: imageUrl,
                established_year: establishedYear, google_maps_url: googleMapsUrl,
                latitude, longitude
            })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        myCache.flushAll();
        res.json(data);
    } catch (err) {
        console.error("Edit club error:", err);
        res.status(500).json({ error: 'Failed to update club' });
    }
});

// Delete club (protected, owner only)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { data: club, error: fetchError } = await supabase
            .from('clubs')
            .select('user_id')
            .eq('id', req.params.id)
            .single();
            
        if (fetchError || !club) return res.status(404).json({ error: 'Club not found' });
        
        if (club.user_id && club.user_id.toString() !== req.user.id.toString()) {
            return res.status(403).json({ error: 'You are not authorized to delete this club' });
        }
        
        const { error: deleteError } = await supabase
            .from('clubs')
            .delete()
            .eq('id', req.params.id);
            
        if (deleteError) throw deleteError;
        myCache.flushAll();
        res.json({ message: 'Club deleted successfully' });
    } catch (err) {
        console.error("Delete club error:", err);
        res.status(500).json({ error: 'Failed to delete club' });
    }
});

module.exports = router;
