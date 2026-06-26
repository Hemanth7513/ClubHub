const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../supabase');
const { authenticateToken } = require('../middleware/authMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || 'clubhub_secret_2024';

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
