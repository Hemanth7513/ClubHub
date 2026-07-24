const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { sanitizeStrings } = require('./middleware/validationMiddleware');

// Ensure env loaded from backend folder
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Strict startup validation for critical ENV vars
const requiredEnvs = [
    'SUPABASE_URL', 
    'SUPABASE_ANON_KEY', 
    'JWT_SECRET',
    'FRONTEND_URL'
];
for (const env of requiredEnvs) {
    if (!process.env[env]) {
        console.error(`FATAL ERROR: Missing required environment variable: ${env}`);
        process.exit(1);
    }
}

const app = express();

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: false,
}));

// Strict CORS: No wildcards allowed.
const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:5173'];

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Limit request body to 10kb — prevents large-payload DoS attacks (Check 7)
app.use(express.json({ limit: '10kb' }));


// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api/', limiter);

// Health check
app.get('/', (req, res) => res.json({ status: 'ok', message: 'ClubHub API is live' }));

// Import Routes
const authRoutes = require('./routes/auth');
const clubRoutes = require('./routes/clubs');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');
const searchRoutes = require('./routes/search');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/search', searchRoutes);

// Global Error Handler — temporarily exposing error details to debug 500 error
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.stack || err.message);
    res.status(500).json({ error: 'Internal Server Error', detail: err.message, stack: err.stack });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`ClubHub Backend listening on port ${PORT}`);
});
