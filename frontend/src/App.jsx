import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import CookieBanner from './components/CookieBanner/CookieBanner';
import Floaties from './components/Ambience/Floaties';
import ScrollProgress from './components/ScrollProgress';
import PageTransition from './components/PageTransition/PageTransition';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import './index.css';

// Lazy loaded pages to reduce initial bundle size
const DirectoryPage = lazy(() => import('./pages/DirectoryPage'));
const ClubDetailPage = lazy(() => import('./pages/ClubDetailPage'));
const AddClubPage = lazy(() => import('./pages/AddClubPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const AddEventPage = lazy(() => import('./pages/AddEventPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100%' }}>
    <div className="spinner"></div>
  </div>
);

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
          <Suspense fallback={<PageLoader />}>
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
              <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </main>
      <CookieBanner />
      <Footer />
    </div>
  );
}

export default App;
