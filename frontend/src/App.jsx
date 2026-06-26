import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

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
import DashboardPage from './pages/DashboardPage';
import MapPage from './pages/MapPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

import Floaties from './components/Ambience/Floaties';
import ScrollProgress from './components/ScrollProgress';
import PageTransition from './components/PageTransition/PageTransition';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import './index.css';

function App() {
  const location = useLocation();

  return (
    <div className="app-container">
      <div className="mesh-bg" />
      <ScrollProgress />
      <Floaties />

      <Header />
      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><DirectoryPage /></PageTransition>} />
            <Route path="/map" element={<PageTransition><MapPage /></PageTransition>} />
            <Route path="/club/:id" element={<PageTransition><ClubDetailPage /></PageTransition>} />
            <Route path="/add-club" element={
              <ProtectedRoute>
                <PageTransition><AddClubPage /></PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
            <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
            <Route path="/events" element={<PageTransition><EventsPage /></PageTransition>} />
            <Route path="/support" element={<PageTransition><SupportPage /></PageTransition>} />
            <Route path="/settings" element={
              <ProtectedRoute>
                <PageTransition><SettingsPage /></PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/add-event" element={
              <ProtectedRoute>
                <PageTransition><AddEventPage /></PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <PageTransition><DashboardPage /></PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <AdminRoute>
                <PageTransition><AdminDashboardPage /></PageTransition>
              </AdminRoute>
            } />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default App;
