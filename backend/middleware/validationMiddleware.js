/**
 * Input validation middleware for ClubHub.
 * All validation is enforced server-side — frontend checks are supplementary only.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const NAME_MAX_LENGTH = 100;
const BIO_MAX_LENGTH = 500;

/**
 * Validate auth inputs: email format, password strength, name length.
 * Used on /register and /change-password.
 */
const validateAuthInput = (req, res, next) => {
    const { email, password, name } = req.body;

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
        return res.status(400).json({ error: 'A valid email address is required.' });
    }

    if (!password || typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) {
        return res.status(400).json({
            error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`
        });
    }
    // Reject passwords that are only spaces
    if (password.trim().length === 0) {
        return res.status(400).json({ error: 'Password cannot be blank.' });
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Name is required.' });
    }
    if (name.length > NAME_MAX_LENGTH) {
        return res.status(400).json({ error: `Name must be under ${NAME_MAX_LENGTH} characters.` });
    }

    next();
};

/**
 * Validate password reset inputs: token presence, new password strength.
 */
const validatePasswordReset = (req, res, next) => {
    const { token, newPassword } = req.body;

    if (!token || typeof token !== 'string' || token.trim().length === 0) {
        return res.status(400).json({ error: 'Reset token is required.' });
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < PASSWORD_MIN_LENGTH) {
        return res.status(400).json({
            error: `New password must be at least ${PASSWORD_MIN_LENGTH} characters long.`
        });
    }

    if (newPassword.trim().length === 0) {
        return res.status(400).json({ error: 'New password cannot be blank.' });
    }

    next();
};

/**
 * Sanitize string fields — trims whitespace from all string body values.
 * Does NOT strip HTML (Supabase handles storage safely).
 */
const sanitizeStrings = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        for (const key of Object.keys(req.body)) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].trim();
            }
        }
    }
    next();
};

/**
 * Validate club input: name, description, category.
 */
const validateClubInput = (req, res, next) => {
    const { name, description, category } = req.body;

    if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Club name is required' });
    }
    if (name.length > 100) {
        return res.status(400).json({ error: 'Club name must be under 100 characters' });
    }
    if (description && description.length > 5000) {
        return res.status(400).json({ error: 'Description must be under 5000 characters' });
    }
    if (!category || category.trim().length === 0) {
        return res.status(400).json({ error: 'Category is required' });
    }

    next();
};

/**
 * Validate event input: title, date, location.
 */
const validateEventInput = (req, res, next) => {
    const { title, date, location } = req.body;

    if (!title || title.trim().length === 0) {
        return res.status(400).json({ error: 'Event title is required' });
    }
    if (title.length > 100) {
        return res.status(400).json({ error: 'Event title must be under 100 characters' });
    }
    if (!date) {
        return res.status(400).json({ error: 'Event date is required' });
    }

    next();
};

module.exports = {
    validateAuthInput,
    validatePasswordReset,
    sanitizeStrings,
    validateClubInput,
    validateEventInput,
};
