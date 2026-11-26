const NodeCache = require('node-cache');

// Shared TTL caches (120 seconds) so admin mutations can invalidate public route caches
const clubsCache = new NodeCache({ stdTTL: 120 });
const eventsCache = new NodeCache({ stdTTL: 120 });

module.exports = { clubsCache, eventsCache };
