/**
 * ClubHub Security Logger
 * Structured JSON logging for security events.
 * - Never logs passwords, tokens, or card numbers.
 * - Masks email to protect user privacy in log files.
 * - Ready to pipe to external monitoring (Sentry/Datadog) via env config.
 */

/**
 * Mask email: user@domain.com → u***@domain.com
 */
const maskEmail = (email) => {
    if (!email || typeof email !== 'string') return '[unknown]';
    const [local, domain] = email.split('@');
    if (!domain) return '[invalid]';
    return `${local[0]}***@${domain}`;
};

/**
 * Extract client IP, handling proxies.
 */
const getIp = (req) => {
    return (
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.socket?.remoteAddress ||
        'unknown'
    );
};

/**
 * Core security event logger.
 * @param {string} event   - Event type (see SECURITY_EVENTS)
 * @param {object} details - Additional context (email, userId, etc.)
 * @param {object} [req]   - Express request (used to extract IP + userAgent)
 */
const securityLog = (event, details = {}, req = null) => {
    const logEntry = {
        event,
        timestamp: new Date().toISOString(),
        ip: req ? getIp(req) : details.ip || 'n/a',
        userAgent: req ? (req.headers['user-agent'] || 'unknown') : 'n/a',
        // Mask email if present
        ...(details.email && { email: maskEmail(details.email) }),
        ...(details.userId && { userId: details.userId }),
        ...(details.reason && { reason: details.reason }),
        ...(details.action && { action: details.action }),
        ...(details.role && { role: details.role }),
        ...(details.attempts && { attempts: details.attempts }),
        ...(details.resource && { resource: details.resource }),
    };

    // Emit as structured JSON to stdout
    console.log(JSON.stringify(logEntry));

    // Future: pipe to external service
    // if (process.env.SENTRY_DSN) Sentry.captureMessage(event, { extra: logEntry });
};

/** Canonical event type constants */
const SECURITY_EVENTS = {
    LOGIN_SUCCESS:            'auth.login_success',
    LOGIN_FAILED:             'auth.login_failed',
    LOGIN_BLOCKED:            'auth.login_blocked_lockout',
    ACCOUNT_LOCKED:           'auth.account_locked',
    LOGOUT:                   'auth.logout',
    OTP_REQUESTED:            'auth.otp_requested',
    OTP_VERIFIED:             'auth.otp_verified',
    OTP_FAILED:               'auth.otp_failed',
    REGISTER_ATTEMPT:         'auth.register_attempt',
    GOOGLE_LOGIN:             'auth.google_login',
    PASSWORD_RESET_REQUEST:   'auth.password_reset_requested',
    PASSWORD_RESET_USED:      'auth.password_reset_completed',
    PASSWORD_RESET_INVALID:   'auth.password_reset_invalid_token',
    PASSWORD_CHANGED:         'auth.password_changed',
    ADMIN_ACTION:             'admin.action',
    PAYMENT_ACTION:           'payment.action',
    UNAUTHORIZED_ACCESS:      'security.unauthorized_access',
    RATE_LIMIT_HIT:           'security.rate_limit_hit',
    INPUT_VALIDATION_FAILED:  'security.input_validation_failed',
};

module.exports = { securityLog, maskEmail, getIp, SECURITY_EVENTS };
