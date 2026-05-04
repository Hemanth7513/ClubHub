const rawUrl = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://clubhub-n6f2.onrender.com/api');

// Force /api suffix if missing to prevent 404s
const API_BASE_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl.replace(/\/$/, '')}/api`;

export default API_BASE_URL;
