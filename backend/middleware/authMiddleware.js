const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('FATAL: JWT_SECRET env var is missing.');
const supabase = require('../supabase');
const { securityLog, SECURITY_EVENTS } = require('../utils/logger');

/**
 * Verify JWT and attach req.user.
 * Also checks token_version against DB to invalidate old tokens
 * (e.g., issued before a password change).
 */
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Token version and role check — invalidates tokens and revalidates permissions
    const { data: user, error } = await supabase
        .from('users')
        .select('token_version, role')
        .eq('id', decoded.id)
        .single();

    if (error || !user) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }

    if (decoded.tokenVersion !== undefined && user.token_version !== decoded.tokenVersion) {
        securityLog(SECURITY_EVENTS.UNAUTHORIZED_ACCESS, {
            userId: decoded.id,
            reason: 'stale_token_version',
        }, req);
        return res.status(403).json({ error: 'Session expired. Please log in again.' });
    }

    req.user = { ...decoded, role: user.role || 'user' };
    next();
};

/**
 * requireRole(...roles) — middleware factory for RBAC.
 * Checks JWT is valid AND that req.user.role is in the allowed list.
 *
 * Usage:
 *   router.get('/admin/stats', requireRole('admin'), handler);
 *   router.put('/mod/action',  requireRole('admin', 'mod'), handler);
 */
const requireRole = (...roles) => [
    authenticateToken,
    (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            securityLog(SECURITY_EVENTS.UNAUTHORIZED_ACCESS, {
                userId: req.user.id,
                email: req.user.email,
                role: req.user.role,
                reason: `requires_role:[${roles.join('|')}]`,
                resource: req.originalUrl,
            }, req);
            return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
        }
        next();
    }
];

/**
 * Legacy alias — kept for compatibility. Prefer requireRole('admin').
 */
const authenticateAdmin = requireRole('admin');

module.exports = { authenticateToken, authenticateAdmin, requireRole };
