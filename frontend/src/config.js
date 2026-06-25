// In production, Vercel will inject process.env.VITE_API_URL
// If it's missing (e.g. during local development), default to localhost
const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Force /api suffix if missing to prevent 404s
const API_BASE_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl.replace(/\/$/, '')}/api`;

export default API_BASE_URL;
