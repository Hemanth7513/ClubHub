# 🏛️ ClubHub | Vijayawada Community Portal

ClubHub is a premium, high-engagement community discovery platform designed for the modern social fabric of Vijayawada. Built with an **"Editorial GenZ"** aesthetic, it combines neo-brutalist design with fluid interactions to connect local clubs with their future members.

## ✨ Core Features

-   **Interactive Map Directory**: An ultra-compact, brutalist-styled interactive map to discover clubs by location across Vijayawada.
-   **Smart Directory**: Verified database of local clubs with real-time filtering, search, and category exploration.
-   **Editorial Aesthetics**: Premium typography (`Syne` & `Outfit`), custom dark/light modes, and a vibrant "Electric" color palette.
-   **Interactive UI**: Velocity-sensitive scroll progress, magnetic buttons, and glass-brutalist components.
-   **Secure Auth**: Custom JWT-based authentication integrated with Supabase PostgreSQL.
-   **Event Ticketing**: Integrated event discovery and secure ticket purchasing powered by Razorpay.

## 🛠️ Technology Stack

-   **Frontend**: React 18 (Vite), Framer Motion (Animations), React Leaflet (Maps).
-   **Backend**: Node.js (Express), Supabase (PostgreSQL Database & Storage).
-   **Payments**: Razorpay API.
-   **Security**: Helmet, Express Rate Limit, JWT, Bcrypt.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- A Supabase Project
- Razorpay API Keys

### 1. Clone the repository
```bash
git clone https://github.com/Hemanth7513/ClubHub.git
cd ClubHub
```

### 2. Setup Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory with:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```
Run the backend:
```bash
npm start
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend` directory with:
```env
VITE_API_URL=http://localhost:5000/api
```
Run the frontend:
```bash
npm run dev
```

## 🎨 Design Philosophy
The project follows a **"Premium Brutalist"** design language:
- **Bold Geometry**: Thick borders and high-contrast shadows.
- **Glassmorphism**: Frosted glass panels (`backdrop-filter`) for content cards.
- **Motion-First**: Smooth transitions using `framer-motion` to create a living, breathing interface.

## 📄 License
MIT License. Open for community contributions.

---
Built with ❤️ for the Vijayawada Community.
