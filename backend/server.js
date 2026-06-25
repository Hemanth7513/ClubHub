const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const supabase = require('./supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Ensure env loaded from backend folder
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const JWT_SECRET = process.env.JWT_SECRET || 'clubhub_secret_2024';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_clubhub123',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_clubhub123',
});

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

    jwt.verify(token, JWT_SECRET, (err, user) => {
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
        console.error("Fetch clubs error:", err);
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
                established_year: establishedYear, google_maps_url: googleMapsUrl,
                user_id: req.user.id
            }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) {
        console.error("Add club error:", err);
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
        const { data: newUser, error: userError } = await supabase
            .from('users')
            .insert([{ email, password: hashedPassword, name }])
            .select()
            .single();

        if (userError) throw userError;

        // Create associated profile
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
                user_id: newUser.id,
                bio: '',
                avatar_url: '',
                theme_preference: 'dark',
                notifications_enabled: true
            }]);

        if (profileError) {
            console.error("Profile creation warning:", profileError);
        }
        
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
            JWT_SECRET, 
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
                image_url: imageUrl, category,
                user_id: req.user.id
            }])
            .select();
        
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- TICKETING & PAYMENT API ---

app.post('/api/payment/create-order', authenticateToken, async (req, res) => {
    try {
        const { ticketId, quantity } = req.body;

        // 1. Fetch ticket details
        const { data: ticket, error: ticketError } = await supabase
            .from('tickets')
            .select('*')
            .eq('id', ticketId)
            .single();

        if (ticketError || !ticket) return res.status(404).json({ error: 'Ticket not found' });
        
        // 2. Calculate Pricing (5% Platform Fee)
        const baseTotal = ticket.price_inr * quantity;
        const platformFee = baseTotal * 0.05;
        const finalTotal = baseTotal + platformFee;

        // 3. Create Razorpay Order
        const options = {
            amount: Math.round(finalTotal * 100), // amount in smallest currency unit (paise)
            currency: "INR",
            receipt: `receipt_ticket_${ticketId}_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        // 4. Record Pending Order in DB
        const { data: orderRecord, error: orderError } = await supabase
            .from('orders')
            .insert([{
                user_id: req.user.id,
                ticket_id: ticketId,
                quantity: quantity,
                total_amount_inr: finalTotal,
                platform_fee_inr: platformFee,
                payment_id: order.id,
                status: 'PENDING'
            }])
            .select()
            .single();

        if (orderError) throw orderError;

        res.json({
            orderId: order.id,
            amount: options.amount,
            currency: options.currency,
            dbOrderId: orderRecord.id
        });
    } catch (err) {
        console.error("Create order error:", err);
        res.status(500).json({ error: 'Failed to create payment order' });
    }
});

app.post('/api/payment/verify', authenticateToken, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = req.body;

        // Verify Signature
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'secret_clubhub123')
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // Payment is successful
            const { error: updateError } = await supabase
                .from('orders')
                .update({ status: 'SUCCESS' })
                .eq('id', dbOrderId);

            if (updateError) throw updateError;
            
            res.json({ message: "Payment verified successfully" });
        } else {
            // Invalid signature
            await supabase
                .from('orders')
                .update({ status: 'FAILED' })
                .eq('id', dbOrderId);
                
            res.status(400).json({ error: "Invalid signature sent!" });
        }
    } catch (err) {
        console.error("Verify payment error:", err);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
});

// --- ADVANCED AUTH & PROFILE ENDPOINTS ---

// Get current user profile and settings
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, email, name, google_id, created_at')
            .eq('id', req.user.id)
            .single();
            
        if (userError || !user) return res.status(404).json({ error: 'User not found' });
        
        let { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
        if (profileError || !profile) {
            const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert([{
                    user_id: user.id,
                    bio: '',
                    avatar_url: '',
                    theme_preference: 'dark',
                    notifications_enabled: true
                }])
                .select()
                .single();
                
            if (!createError && newProfile) {
                profile = newProfile;
            }
        }
        
        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                googleId: user.google_id,
                createdAt: user.created_at
            },
            profile: profile ? {
                bio: profile.bio || '',
                avatarUrl: profile.avatar_url || '',
                themePreference: profile.theme_preference || 'dark',
                notificationsEnabled: profile.notifications_enabled !== false
            } : {
                bio: '',
                avatarUrl: '',
                themePreference: 'dark',
                notificationsEnabled: true
            }
        });
    } catch (err) {
        console.error("Fetch me error:", err);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

// Update user profile and preferences
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const { name, bio, avatarUrl, themePreference, notificationsEnabled } = req.body;
        
        if (name) {
            const { error: userError } = await supabase
                .from('users')
                .update({ name })
                .eq('id', req.user.id);
            if (userError) throw userError;
        }
        
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                user_id: req.user.id,
                bio,
                avatar_url: avatarUrl,
                theme_preference: themePreference,
                notifications_enabled: notificationsEnabled
            }, { onConflict: 'user_id' });
            
        if (profileError) throw profileError;
        
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error("Update profile error:", err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Change user password
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        const { data: user, error } = await supabase
            .from('users')
            .select('password')
            .eq('id', req.user.id)
            .single();
            
        if (error || !user) return res.status(404).json({ error: 'User not found' });
        
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Incorrect current password' });
        
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        
        const { error: updateError } = await supabase
            .from('users')
            .update({ password: hashedNewPassword })
            .eq('id', req.user.id);
            
        if (updateError) throw updateError;
        
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error("Change password error:", err);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// Delete user account
app.delete('/api/auth/delete-account', authenticateToken, async (req, res) => {
    try {
        const { password } = req.body;
        
        const { data: user, error } = await supabase
            .from('users')
            .select('password')
            .eq('id', req.user.id)
            .single();
            
        if (error || !user) return res.status(404).json({ error: 'User not found' });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Incorrect password' });
        
        const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', req.user.id);
            
        if (deleteError) throw deleteError;
        
        res.json({ message: 'Account deleted successfully' });
    } catch (err) {
        console.error("Delete account error:", err);
        res.status(500).json({ error: 'Failed to delete account' });
    }
});

// Get user-created clubs
app.get('/api/users/clubs', authenticateToken, async (req, res) => {
    try {
        const { data: clubs, error } = await supabase
            .from('clubs')
            .select('*')
            .eq('user_id', req.user.id)
            .order('name', { ascending: true });
            
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
            createdAt: c.created_at
        }));
        
        res.json(mappedClubs);
    } catch (err) {
        console.error("Get user clubs error:", err);
        res.status(500).json({ error: 'Failed to fetch user clubs' });
    }
});

// Get user-created events
app.get('/api/users/events', authenticateToken, async (req, res) => {
    try {
        const { data: events, error } = await supabase
            .from('events')
            .select('*, clubs(name)')
            .eq('user_id', req.user.id)
            .order('date', { ascending: true });
            
        if (error) throw error;
        res.json(events);
    } catch (err) {
        console.error("Get user events error:", err);
        res.status(500).json({ error: 'Failed to fetch user events' });
    }
});

// Delete club (protected, owner only)
app.delete('/api/clubs/:id', authenticateToken, async (req, res) => {
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
        res.json({ message: 'Club deleted successfully' });
    } catch (err) {
        console.error("Delete club error:", err);
        res.status(500).json({ error: 'Failed to delete club' });
    }
});

// Delete event (protected, owner only)
app.delete('/api/events/:id', authenticateToken, async (req, res) => {
    try {
        const { data: event, error: fetchError } = await supabase
            .from('events')
            .select('user_id')
            .eq('id', req.params.id)
            .single();
            
        if (fetchError || !event) return res.status(404).json({ error: 'Event not found' });
        
        if (event.user_id && event.user_id.toString() !== req.user.id.toString()) {
            return res.status(403).json({ error: 'You are not authorized to delete this event' });
        }
        
        const { error: deleteError } = await supabase
            .from('events')
            .delete()
            .eq('id', req.params.id);
            
        if (deleteError) throw deleteError;
        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        console.error("Delete event error:", err);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`ClubHub Backend listening on port ${PORT}`);
});
