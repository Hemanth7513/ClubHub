const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet()); 
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Traffic Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Rate Limiting: Max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

app.use(express.json());

// Public fields for club listings
const PUBLIC_FIELDS = "id, name, category, description, location, contactInfo, imageUrl, establishedYear, googleMapsUrl";

// Auth Middleware
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

// Validation Helpers
const isValidEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
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
        const query = `INSERT INTO users (email, password, name) VALUES (?, ?, ?)`;
        db.run(query, [email, hashedPassword, name || ''], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Email already registered.' });
                }
                return res.status(500).json({ error: 'Failed to register user.' });
            }
            res.status(201).json({ message: 'User registered successfully' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Internal server error' });
        if (!user || !user.password) return res.status(400).json({ error: 'Invalid email or password.' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid email or password.' });

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    });
});

// --- CLUB ROUTES ---

// Get all clubs (with optional search and category filters)
app.get('/api/clubs', (req, res) => {
    const { search, category } = req.query;
    let query = `SELECT ${PUBLIC_FIELDS} FROM clubs WHERE 1=1`;
    let params = [];

    if (search) {
        query += " AND (name LIKE ? OR description LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
    }

    if (category && category !== 'All') {
        query += " AND category = ?";
        params.push(category);
    }

    query += " ORDER BY createdAt DESC";

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(rows);
    });
});

// Get club details by ID
app.get('/api/clubs/:id', (req, res) => {
    const { id } = req.params;
    db.get(`SELECT ${PUBLIC_FIELDS} FROM clubs WHERE id = ?`, [id], (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Club not found' });
            return;
        }
        res.json(row);
    });
});

// Create a new club (Protected)
app.post('/api/clubs', authenticateToken, (req, res) => {
    const { name, category, description, location, contactInfo, imageUrl, establishedYear } = req.body;
    
    if (!name || !category || !description) {
        return res.status(400).json({ error: 'Name, category, and description are required.' });
    }

    const defaultImage = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1000&auto=format&fit=crop';
    
    // Generate Google Maps search URL for new clubs
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + (location || '') + ' Vijayawada')}`;

    const query = `
        INSERT INTO clubs (name, category, description, location, contactInfo, imageUrl, establishedYear, googleMapsUrl)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
        name, 
        category, 
        description, 
        location || '', 
        contactInfo || '', 
        imageUrl || defaultImage, 
        establishedYear || null,
        googleMapsUrl
    ];

    db.run(query, params, function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Failed to create club' });
            return;
        }
        res.status(201).json({ id: this.lastID, message: 'Club created successfully' });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
