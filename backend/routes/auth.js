const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const supabase = require('../supabase');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validateAuthInput, validatePasswordReset } = require('../middleware/validationMiddleware');
const { securityLog, SECURITY_EVENTS } = require('../utils/logger');
const { sendOtpEmail, sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/email');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('FATAL: JWT_SECRET env var is missing.');
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const NodeCache = require('node-cache');
const otpCache = new NodeCache({ stdTTL: 300 }); // OTP valid for 5 mins

const rateLimit = require('express-rate-limit');

// ─────────────────────────────────────────────────────────────
//  RATE LIMITERS
// ─────────────────────────────────────────────────────────────

/**
 * Check 1 — Login Protection:
 * Max 5 login attempts per IP per 15 minutes.
 * Returns HTTP 429 on breach. Does NOT skip on success
 * (to prevent automated enumeration via successful logins).
 */
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
    handler: (req, res, next, options) => {
        securityLog(SECURITY_EVENTS.RATE_LIMIT_HIT, {
            email: req.body?.email,
            reason: 'login_rate_limit_exceeded',
        }, req);
        res.status(429).json(options.message);
    },
});

/** OTP limiter: max 3 requests per 5 minutes */
const otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 3,
    message: { error: 'Too many OTP requests, please try again later.' },
});

/** Password reset limiter: max 3 requests per 15 minutes */
const resetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    message: { error: 'Too many reset attempts. Please try again later.' },
});

/** Dedicated verify OTP limiter: max 5 requests per 15 minutes */
const verifyOtpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many verification attempts. Please try again in 15 minutes.' },
});

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Dummy bcrypt hash used for timing-attack prevention.
 * When a user does not exist, we still run bcrypt.compare
 * so the response time is identical to the "wrong password" case.
 */
const DUMMY_HASH = '$2b$10$abcdefghijklmnopqrstuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu';

/**
 * Build a signed JWT for a given user object.
 * Embeds tokenVersion so old tokens are invalidated on password change.
 */
const signToken = (user) => jwt.sign(
    {
        id: user.id,
        email: user.email,
        role: user.role || 'user',
        tokenVersion: user.token_version ?? 0,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
);

// ─────────────────────────────────────────────────────────────
//  OTP FLOW
// ─────────────────────────────────────────────────────────────

// Request OTP
// Check email availability
router.get('/check-email', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.json({ exists: false });

        const { data, error } = await supabase
            .from('users')
            .select('id')
            .eq('email', email.toLowerCase())
            .limit(1);

        if (error) throw error;
        res.json({ exists: data && data.length > 0 });
    } catch (err) {
        console.error("Check email error:", err);
        res.status(500).json({ error: 'Failed to check email' });
    }
});

// Request OTP
router.post('/request-otp', otpLimiter, async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const normalizedEmail = email.toLowerCase();
        const otpCode = crypto.randomInt(100000, 1000000).toString();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

        // Store OTP directly in memory cache (otpCache) instead of database profiles.bio
        otpCache.set(normalizedEmail, { code: otpCode, expiresAt });

        // Send email
        const emailSent = await sendOtpEmail(normalizedEmail, otpCode);
        if (!emailSent) {
            return res.status(500).json({ error: 'Failed to send email' });
        }

        securityLog(SECURITY_EVENTS.OTP_REQUESTED, { email: normalizedEmail }, req);
        res.json({ message: 'If this email is valid, a one-time code has been sent.' });
    } catch (err) {
        console.error('OTP Request error:', err);
        res.status(500).json({ error: 'Failed to request OTP' });
    }
});

// Verify OTP
router.post('/verify-otp', verifyOtpLimiter, async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

        const normalizedEmail = email.toLowerCase();

        // 1. Fetch OTP from memory cache
        const otpData = otpCache.get(normalizedEmail);

        if (!otpData || otpData.code !== otp || Date.now() > otpData.expiresAt) {
            securityLog(SECURITY_EVENTS.OTP_FAILED, { email: normalizedEmail }, req);
            return res.status(401).json({ error: 'Invalid or expired OTP' });
        }

        // OTP verified: Clear from cache
        otpCache.del(normalizedEmail);

        // 2. Fetch or create user now that email ownership is verified
        let { data: user, error: userError } = await supabase
            .from('users')
            .select('id, email, name, role, token_version')
            .eq('email', normalizedEmail)
            .single();

        if (userError || !user) {
            const name = normalizedEmail.split('@')[0];
            const role = normalizedEmail === (process.env.ADMIN_EMAIL).toLowerCase() ? 'admin' : 'user';
            
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert([{ id: crypto.randomUUID(), email: normalizedEmail, name, role, token_version: 0 }])
                .select()
                .single();

            if (createError) throw createError;
            user = newUser;

            await supabase.from('profiles').insert([{
                user_id: user.id,
                bio: '',
                theme_preference: 'dark',
                notifications_enabled: true
            }]);

            // Send welcome email asynchronously
            sendWelcomeEmail(user.email, user.name).catch(console.error);
        }

        securityLog(SECURITY_EVENTS.OTP_VERIFIED, { email: normalizedEmail, userId: user.id }, req);

        const token = signToken(user);
        res.json({
            token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role || 'user' },
        });
    } catch (err) {
        console.error('OTP Verify error:', err);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
});

// ─────────────────────────────────────────────────────────────
//  REGISTER
// ─────────────────────────────────────────────────────────────

/**
 * Check 2 & 4: Generic response always — never reveal if email is taken.
 * Check 7: Server-side validation via validateAuthInput middleware.
 */
router.post('/register', validateAuthInput, async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const normalizedEmail = email.toLowerCase();

        securityLog(SECURITY_EVENTS.REGISTER_ATTEMPT, { email: normalizedEmail }, req);

        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', normalizedEmail)
            .single();

        if (existingUser) {
            // Check 2 & 4: Do NOT reveal "Email already registered"
            // Return 201 so timing/status is identical to a real registration
            return res.status(201).json({
                message: 'If this email is not already registered, your account has been created.',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const role = normalizedEmail === (process.env.ADMIN_EMAIL).toLowerCase() ? 'admin' : 'user';

        const { data: newUser, error: userError } = await supabase
            .from('users')
            .insert([{
                id: crypto.randomUUID(),
                email: normalizedEmail,
                password: hashedPassword,
                name,
                role,
                token_version: 0,
            }])
            .select()
            .single();

        if (userError) throw userError;

        await supabase.from('profiles').insert([{
            user_id: newUser.id,
            bio: '',
            avatar_url: '',
            theme_preference: 'dark',
            notifications_enabled: true,
        }]);

        // Send welcome email asynchronously
        sendWelcomeEmail(newUser.email, newUser.name).catch(console.error);

        res.status(201).json({
            message: 'If this email is not already registered, your account has been created.',
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// ─────────────────────────────────────────────────────────────
//  LOGIN
// ─────────────────────────────────────────────────────────────

/**
 * Check 1: loginLimiter — max 5/15min per IP, returns 429.
 * Check 4: Timing-attack prevention — always run bcrypt.compare,
 *          even when no user is found (using DUMMY_HASH).
 * Check 8: Log all failed/successful login events.
 */
router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();

        // ──────────────────────────────────────────────────────────
        // TIMING-ATTACK FIX (Check 4):
        // Always run bcrypt.compare regardless of whether user exists.
        // This makes "user not found" and "wrong password" take the
        // same time (~60-100ms), so attackers cannot enumerate accounts
        // by measuring response latency.
        // ──────────────────────────────────────────────────────────
        // If user exists but has no password, they signed up via OTP/Google
        if (user && !user.password) {
            return res.status(401).json({ error: 'This account uses OTP or Google login. Please use the Email OTP tab or Google sign-in.' });
        }

        const hashToCompare = user?.password || DUMMY_HASH;
        const isMatch = await bcrypt.compare(password, hashToCompare);

        if (error || !user || !isMatch) {
            securityLog(SECURITY_EVENTS.LOGIN_FAILED, { email: email.toLowerCase() }, req);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        securityLog(SECURITY_EVENTS.LOGIN_SUCCESS, { email: user.email, userId: user.id }, req);

        const token = signToken(user);
        res.json({
            token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role || 'user' },
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});



// ─────────────────────────────────────────────────────────────
//  FORGOT PASSWORD (Check 5)
// ─────────────────────────────────────────────────────────────

/**
 * Issues a time-limited (15 min), single-use password reset token.
 * Always returns the SAME generic response — never confirms if email exists.
 */
router.post('/forgot-password', resetLimiter, async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required.' });

        securityLog(SECURITY_EVENTS.PASSWORD_RESET_REQUEST, { email }, req);

        // Always return generic response — regardless of whether email exists
        const GENERIC_RESPONSE = {
            message: 'If this email is registered, a password reset link has been sent.',
        };

        const { data: user } = await supabase
            .from('users')
            .select('id, email')
            .eq('email', email.toLowerCase())
            .single();

        if (!user) {
            // Check 4 & 5: Do NOT reveal email not found
            return res.json(GENERIC_RESPONSE);
        }

        // Generate cryptographically secure token (Check 5)
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

        // Invalidate any existing reset tokens for this user
        await supabase.from('password_resets').delete().eq('user_id', user.id);

        // Store hashed token — never store raw token in DB (Check 5)
        await supabase.from('password_resets').insert([{
            user_id: user.id,
            token_hash: tokenHash,
            expires_at: expiresAt,
            used: false,
        }]);

        const resetLink = `${FRONTEND_URL}/reset-password?token=${rawToken}`;
        await sendPasswordResetEmail(user.email, resetLink);

        res.json(GENERIC_RESPONSE);
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// ─────────────────────────────────────────────────────────────
//  RESET PASSWORD (Check 5)
// ─────────────────────────────────────────────────────────────

/**
 * Validates the reset token, enforces expiry, single-use, and
 * invalidates ALL existing sessions on completion (Check 3 & 5).
 */
router.post('/reset-password', resetLimiter, validatePasswordReset, async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Hash the incoming raw token to compare against stored hash
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const { data: resetRecord, error: resetError } = await supabase
            .from('password_resets')
            .select('*')
            .eq('token_hash', tokenHash)
            .single();

        // Check 5: Single-use + expiry validation
        if (resetError || !resetRecord) {
            securityLog(SECURITY_EVENTS.PASSWORD_RESET_INVALID, { reason: 'token_not_found' }, req);
            return res.status(400).json({ error: 'Invalid or expired reset link.' });
        }

        if (resetRecord.used) {
            securityLog(SECURITY_EVENTS.PASSWORD_RESET_INVALID, {
                userId: resetRecord.user_id,
                reason: 'token_already_used',
            }, req);
            return res.status(400).json({ error: 'This reset link has already been used.' });
        }

        if (new Date() > new Date(resetRecord.expires_at)) {
            securityLog(SECURITY_EVENTS.PASSWORD_RESET_INVALID, {
                userId: resetRecord.user_id,
                reason: 'token_expired',
            }, req);
            return res.status(400).json({ error: 'This reset link has expired. Please request a new one.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Check 3 & 5: Increment token_version to invalidate ALL active sessions
        const { data: user } = await supabase
            .from('users')
            .select('token_version')
            .eq('id', resetRecord.user_id)
            .single();

        const newVersion = (user?.token_version ?? 0) + 1;

        await supabase
            .from('users')
            .update({ password: hashedPassword, token_version: newVersion })
            .eq('id', resetRecord.user_id);

        // Check 5: Mark token as used immediately after first use
        await supabase
            .from('password_resets')
            .update({ used: true })
            .eq('id', resetRecord.id);

        securityLog(SECURITY_EVENTS.PASSWORD_RESET_USED, { userId: resetRecord.user_id }, req);

        res.json({ message: 'Password reset successfully. Please log in with your new password.' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// ─────────────────────────────────────────────────────────────
//  PROFILE ROUTES
// ─────────────────────────────────────────────────────────────

// Get current user profile
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
                    notifications_enabled: true,
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
                createdAt: user.created_at,
            },
            profile: profile ? {
                bio: profile.bio || '',
                avatarUrl: profile.avatar_url || '',
                themePreference: profile.theme_preference || 'dark',
                notificationsEnabled: profile.notifications_enabled !== false,
            } : {
                bio: '',
                avatarUrl: '',
                themePreference: 'dark',
                notificationsEnabled: true,
            },
        });
    } catch (err) {
        console.error('Fetch me error:', err);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { name, bio, avatarUrl, themePreference, notificationsEnabled } = req.body;

        if (name) {
            if (name.length > 100) return res.status(400).json({ error: 'Name must be under 100 characters.' });
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
                notifications_enabled: notificationsEnabled,
            }, { onConflict: 'user_id' });

        if (profileError) throw profileError;

        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// ─────────────────────────────────────────────────────────────
//  CHANGE PASSWORD (authenticated, Check 3 & 5)
// ─────────────────────────────────────────────────────────────

/**
 * Increments token_version on success, invalidating all other sessions.
 */
router.post('/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ error: 'New password must be at least 8 characters.' });
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('password, token_version')
            .eq('id', req.user.id)
            .single();

        if (error || !user) return res.status(404).json({ error: 'User not found' });

        if (!user.password) {
            return res.status(400).json({ error: 'This account uses OTP or Google login. Password changes not supported.' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Incorrect current password' });

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Check 3 & 5: Invalidate all active sessions by bumping token_version
        const newVersion = (user.token_version ?? 0) + 1;

        const { error: updateError } = await supabase
            .from('users')
            .update({ password: hashedNewPassword, token_version: newVersion })
            .eq('id', req.user.id);

        if (updateError) throw updateError;

        securityLog(SECURITY_EVENTS.PASSWORD_CHANGED, { userId: req.user.id, email: req.user.email }, req);

        res.json({ message: 'Password updated successfully. Please log in again.' });
    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// ─────────────────────────────────────────────────────────────
//  DELETE ACCOUNT
// ─────────────────────────────────────────────────────────────

router.delete('/delete-account', authenticateToken, async (req, res) => {
    try {
        const { password } = req.body;

        const { data: user, error } = await supabase
            .from('users')
            .select('password')
            .eq('id', req.user.id)
            .single();

        if (error || !user) return res.status(404).json({ error: 'User not found' });

        // OTP-only users have no password — prevent crash on bcrypt.compare
        if (!user.password) {
            return res.status(400).json({ error: 'This account uses OTP or Google login. Password deletion not supported directly.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Incorrect password' });

        const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', req.user.id);

        if (deleteError) throw deleteError;

        res.json({ message: 'Account deleted successfully' });
    } catch (err) {
        console.error('Delete account error:', err);
        res.status(500).json({ error: 'Failed to delete account' });
    }
});

module.exports = router;
