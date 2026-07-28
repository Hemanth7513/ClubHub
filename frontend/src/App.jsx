import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import CookieBanner from './components/CookieBanner/CookieBanner';
import Floaties from './components/Ambience/Floaties';
import ScrollProgress from './components/ScrollProgress';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import PageTransition from './components/PageTransition/PageTransition';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import OfflineBanner from './components/OfflineBanner';
import SplashScreen from './components/SplashScreen/SplashScreen';
import API_BASE_URL from './config';
import './index.css';

// Lazy loaded pages to reduce initial bundle size
const DirectoryPage = lazy(() => import('./pages/DirectoryPage'));
const ClubDetailPage = lazy(() => import('./pages/ClubDetailPage'));
const AddClubPage = lazy(() => import('./pages/AddClubPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const AddEventPage = lazy(() => import('./pages/AddEventPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
const ClubManagerPage = lazy(() => import('./pages/ClubManagerPage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const EditClubPage = lazy(() => import('./pages/EditClubPage'));
const EditEventPage = lazy(() => import('./pages/EditEventPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function App() {
  const location = useLocation();

  // Scroll to top of the page on route/navigation changes
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const [serverWaking, setServerWaking] = React.useState(false);

  // Ping backend on load to wake it up and show banner if it's sleeping
  React.useEffect(() => {
    let timeout;
    const pingServer = async () => {
      // If server takes more than 2.5 seconds to respond, it's likely sleeping (cold start)
      timeout = setTimeout(() => {
        setServerWaking(true);
      }, 2500);
      
      try {
        await fetch(`${API_BASE_URL}/`); // The root health check endpoint
        clearTimeout(timeout);
        setServerWaking(false);
      } catch (e) {
        clearTimeout(timeout);
        setServerWaking(false);
      }
    };
    pingServer();
  }, []);

  const [showSplash, setShowSplash] = React.useState(false);

  React.useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    if (!hasSeenSplash) {
      setShowSplash(true);
      const timer = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem('hasSeenSplash', 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="app-container">
      <AnimatePresence>
        {showSplash && <SplashScreen key="splash" />}
      </AnimatePresence>
      <div className="mesh-bg" />
      <ScrollProgress />
      <Floaties />
      <OfflineBanner />

      <Header />
      <main>
        <AnimatePresence mode="wait">
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><div className="spinner" /></div>}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><DirectoryPage /></PageTransition>} />
              <Route path="/map" element={
                <ProtectedRoute>
                  <PageTransition><MapPage /></PageTransition>
                </ProtectedRoute>
              } />
              <Route path="/club/:id" element={
                <ProtectedRoute>
                  <PageTransition><ClubDetailPage /></PageTransition>
                </ProtectedRoute>
              } />
              <Route path="/add-club" element={
                <ProtectedRoute>
                  <PageTransition><AddClubPage /></PageTransition>
                </ProtectedRoute>
              } />
              <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
              <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
              <Route path="/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
              <Route path="/reset-password" element={<PageTransition><ResetPasswordPage /></PageTransition>} />
              <Route path="/events" element={
                <ProtectedRoute>
                  <PageTransition><EventsPage /></PageTransition>
                </ProtectedRoute>
              } />
              <Route path="/events/:id" element={
                <ProtectedRoute>
                  <PageTransition><EventDetailPage /></PageTransition>
                </ProtectedRoute>
              } />
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
              <Route path="/edit-club/:id" element={
                <ProtectedRoute>
                  <PageTransition><EditClubPage /></PageTransition>
                </ProtectedRoute>
              } />
              <Route path="/edit-event/:id" element={
                <ProtectedRoute>
                  <PageTransition><EditEventPage /></PageTransition>
                </ProtectedRoute>
              } />
              <Route path="/manage-clubs" element={
                <ProtectedRoute>
                  <PageTransition><ClubManagerPage /></PageTransition>
                </ProtectedRoute>
              } />
              <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </main>
      <ScrollToTop />
      <CookieBanner />
      <Footer />
    </div>
  );
}

export default App;
