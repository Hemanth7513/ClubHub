# 🏛️ ClubHub | Vijayawada Community Portal

ClubHub is a premium, high-engagement community discovery platform designed for discovering and engaging with local clubs and organizations in Vijayawada.

## 🚀 Core Features
- **Brutalist Map Interface**: Minimalist interactive map to discover clubs by location.
- **Smart Directory**: Real-time category-based discovery, text search, and filters.
- **Custom Security Suite**: Multi-layered security checks including rate-limiting, timing-attack mitigations, token validation, and RBAC admin controls.
- **Modern Authentication**: Secure OTP login, traditional credentials, and Google OAuth integrations.

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, React Router, Framer Motion, Leaflet.
- **Backend**: Node.js, Express, Supabase (PostgreSQL), JWT.
see
## ⚙️ Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
# Create .env using variables:
# PORT, JWT_SECRET, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY, FRONTEND_URL, ADMIN_EMAIL, GOOGLE_CLIENT_ID
npm start
```

### 2. Frontend Setup
```bash
cd frontend
npm install
# Create .env with VITE_API_URL and VITE_GOOGLE_CLIENT_ID
npm run dev
```

---
Built for the Vijayawada Community.
