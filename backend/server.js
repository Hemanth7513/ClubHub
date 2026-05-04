const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const supabase = require('./supabase');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api/', limiter);

// Helper function to validate email
const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
        req.user = user;
        next();
    });
};

// --- AUTH ROUTES ---

// Register
app.post('/api/auth/register', async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email format.' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters long.' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const { data, error } = await supabase
            .from('users')
            .insert([{ email, password: hashedPassword, name: name || '' }])
            .select();

        if (error) {
            if (error.code === '23505') { // Unique constraint violation in Postgres
                return res.status(400).json({ error: 'Email already registered.' });
            }
            return res.status(500).json({ error: 'Failed to register user.' });
        }
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) return res.status(400).json({ error: 'Invalid email or password.' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid email or password.' });

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- CLUB ROUTES ---

// Get all clubs
app.get('/api/clubs', async (req, res) => {
    const { search, category } = req.query;
    
    try {
        let query = supabase.from('clubs').select('*');

        if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }

        if (category && category !== 'All') {
            query = query.eq('category', category);
        }

        const { data: clubs, error } = await query.order('name', { ascending: true });

        if (error) throw error;
        res.json(clubs);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch clubs' });
    }
});

// Get single club
app.get('/api/clubs/:id', async (req, res) => {
    try {
        const { data: club, error } = await supabase
            .from('clubs')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error || !club) return res.status(404).json({ error: 'Club not found' });
        res.json(club);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch club details' });
    }
});

// Add a club (Protected)
app.post('/api/clubs', authenticateToken, async (req, res) => {
    const { name, category, description, location, contactInfo, imageUrl, establishedYear } = req.body;

    if (!name || !category || !description) {
        return res.status(400).json({ error: 'Name, category, and description are required.' });
    }

    try {
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + (location || '') + ' Vijayawada')}`;
        
        const { data, error } = await supabase
            .from('clubs')
            .insert([{
                name, category, description, location, contactInfo, imageUrl, 
                establishedYear, googleMapsUrl
            }])
            .select();

        if (error) throw error;
        res.status(201).json({ message: 'Club added successfully', club: data[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add club' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
