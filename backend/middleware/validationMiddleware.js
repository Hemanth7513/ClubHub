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

module.exports = { validateClubInput, validateEventInput };
