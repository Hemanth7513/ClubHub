const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const supabase = require('./supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Health check
app.get('/', (req, res) => res.json({ status: 'ok', message: 'ClubHub API is live' }));

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

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Authentication required' });

    jwt.verify(token, process.env.JWT_SECRET || 'clubhub_secret_vja_2024', (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
};

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

// 3. Register a new club (protected)
app.post('/api/clubs', authenticateToken, async (req, res) => {
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

// --- AUTH ENDPOINTS ---

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        
        // Check if user exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
            
        if (existingUser) return res.status(400).json({ error: 'Email already registered' });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([{ email, password: hashedPassword, name }])
            .select()
            .single();

        if (error) throw error;
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) return res.status(401).json({ error: 'Invalid email or password' });

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            process.env.JWT_SECRET || 'clubhub_secret_2024', 
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: 'Login failed' });
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

// --- Events API ---
app.get('/api/events', async (req, res) => {
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

app.post('/api/events', authenticateToken, async (req, res) => {
    const { clubId, title, description, date, location, imageUrl, category } = req.body;
    try {
        const { data, error } = await supabase
            .from('events')
            .insert([{
                club_id: clubId, title, description, date, location, 
                image_url: imageUrl, category
            }])
            .select();
        
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`ClubHub Backend listening on port ${PORT}`);
});
