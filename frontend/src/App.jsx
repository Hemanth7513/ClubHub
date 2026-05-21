import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import DirectoryPage from './pages/DirectoryPage';
import ClubDetailPage from './pages/ClubDetailPage';
import AddClubPage from './pages/AddClubPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventsPage from './pages/EventsPage';
import SupportPage from './pages/SupportPage';
import AddEventPage from './pages/AddEventPage';
import SettingsPage from './pages/SettingsPage';
import Cursor from './components/Cursor/Cursor';
import Floaties from './components/Ambience/Floaties';
import ScrollProgress from './components/ScrollProgress';
import { useAuth } from './context/AuthContext';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Authenticating...</div>;
  if (!user) return <LoginPage />; // Fallback to login if not authenticated
  return children;
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <div className="mesh-bg" />
        <ScrollProgress />
        <Floaties />
        <Cursor />
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<DirectoryPage />} />
            <Route path="/club/:id" element={<ClubDetailPage />} />
            <Route path="/add-club" element={
              <ProtectedRoute>
                <AddClubPage />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/add-event" element={
              <ProtectedRoute>
                <AddEventPage />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
