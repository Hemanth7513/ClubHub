const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../supabase');
const { authenticateToken } = require('../middleware/authMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || 'clubhub_secret_2024';

const NodeCache = require('node-cache');
const otpCache = new NodeCache({ stdTTL: 300 }); // OTP valid for 5 mins
const { sendOtpEmail } = require('../utils/email');

const rateLimit = require('express-rate-limit');
const otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 3,
    message: { error: 'Too many OTP requests, please try again later.' }
});

// Request OTP
router.post('/request-otp', otpLimiter, async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        // Generate 6 digit code
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save to cache
        otpCache.set(email.toLowerCase(), otpCode);

        // Send Email
        const emailSent = await sendOtpEmail(email, otpCode);
        if (!emailSent) {
            return res.status(500).json({ error: 'Failed to send email' });
        }

        res.json({ message: 'OTP sent to email' });
    } catch (err) {
        console.error("OTP Request error:", err);
        res.status(500).json({ error: 'Failed to request OTP' });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

        const cachedOtp = otpCache.get(email.toLowerCase());
        
        if (!cachedOtp || cachedOtp !== otp) {
            return res.status(401).json({ error: 'Invalid or expired OTP' });
        }

        // Clear OTP after successful use
        otpCache.del(email.toLowerCase());

        // Find or create user
        let { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();

        if (userError || !user) {
            // Auto-register via OTP
            const name = email.split('@')[0];
            const role = email.toLowerCase() === 'hemaxtth@gmail.com' ? 'admin' : 'user';

            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert([{ email: email.toLowerCase(), name, role }])
                .select()
                .single();

            if (createError) throw createError;
            user = newUser;

            // Create profile
            await supabase.from('profiles').insert([{ user_id: user.id, bio: '', avatar_url: '', theme_preference: 'dark', notifications_enabled: true }]);
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role || 'user' }, 
            JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role || 'user' }
        });

    } catch (err) {
        console.error("OTP Verify error:", err);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
});

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
            
        if (existingUser) return res.status(400).json({ error: 'Email already registered' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const role = email.toLowerCase() === 'hemaxtth@gmail.com' ? 'admin' : 'user';

        const { data: newUser, error: userError } = await supabase
            .from('users')
            .insert([{ email, password: hashedPassword, name, role }])
            .select()
            .single();

        if (userError) throw userError;

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
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) return res.status(401).json({ error: 'Invalid email or password' });

        if (!user.password) return res.status(401).json({ error: 'Please login with Google or OTP' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role || 'user' }, 
            JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role || 'user'
            }
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Google OAuth Login
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '121724819330-qvtu35biu59bjp0jkia5vgsngqu073fu.apps.googleusercontent.com');

router.post('/google', async (req, res) => {
    try {
        const { token: googleToken } = req.body;
        
        // Verify the token with Google
        const ticket = await googleClient.verifyIdToken({
            idToken: googleToken,
            audience: process.env.GOOGLE_CLIENT_ID || '121724819330-qvtu35biu59bjp0jkia5vgsngqu073fu.apps.googleusercontent.com',
        });
        const payload = ticket.getPayload();
        
        const email = payload.email.toLowerCase();
        const name = payload.name;
        const google_id = payload.sub;

        // Find or create user
        let { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (userError || !user) {
            const role = email === 'hemaxtth@gmail.com' ? 'admin' : 'user';
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert([{ email, name, google_id, role }])
                .select()
                .single();

            if (createError) throw createError;
            user = newUser;

            // Create profile
            await supabase.from('profiles').insert([{ 
                user_id: user.id, 
                bio: '', 
                avatar_url: payload.picture || '', 
                theme_preference: 'dark', 
                notifications_enabled: true 
            }]);
        } else if (!user.google_id) {
            // Link google account to existing user
            await supabase.from('users').update({ google_id }).eq('id', user.id);
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role || 'user' }, 
            JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role || 'user', avatarUrl: payload.picture }
        });

    } catch (err) {
        console.error("Google Auth error:", err);
        res.status(500).json({ error: 'Google login failed' });
    }
});

// Get current user profile and settings
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, email, name, google_id, role, created_at')
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
                role: user.role || 'user',
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
router.put('/profile', authenticateToken, async (req, res) => {
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
router.post('/change-password', authenticateToken, async (req, res) => {
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
router.delete('/delete-account', authenticateToken, async (req, res) => {
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

module.exports = router;
