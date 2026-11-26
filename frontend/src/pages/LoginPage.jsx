import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, ArrowRight, KeyRound, Eye, EyeOff,
  ShieldAlert, UserCheck, ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import API_BASE_URL from '../config';
import './AuthPages.css';

const parseJsonSafe = async (res) => {
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }
  throw new Error('Server returned an unexpected response. Please try again shortly.');
};

const LoginPage = () => {
  const [portalMode, setPortalMode] = useState('member'); // 'member' | 'superadmin'
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' | 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTarget = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : redirectTarget, { replace: true });
    }
  }, [user, navigate, redirectTarget]);

  const handlePortalSwitch = (mode) => {
    setPortalMode(mode);
    setError('');
    setOtpSent(false);
    if (mode === 'superadmin') {
      setLoginMethod('password');
    }
  };

  const completeLogin = (data) => {
    if (portalMode === 'superadmin' && data.user.role !== 'admin') {
      throw new Error('Access denied: This account does not have Superadmin privileges.');
    }
    login(data.user, data.token);
    if (data.user.role === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate(redirectTarget, { replace: true });
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) throw new Error(data?.error || 'Login failed');
      completeLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email first.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) throw new Error(data?.error || 'Failed to request OTP');
      setOtpSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) throw new Error(data?.error || 'Invalid OTP');
      completeLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isSuperadmin = portalMode === 'superadmin';

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <motion.div
          layout
          className={`auth-card ${isSuperadmin ? 'is-superadmin' : ''}`}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, type: 'spring', stiffness: 160, damping: 20 }}
        >
          {/* Role / Portal Selector */}
          <div className="portal-switcher" role="tablist" aria-label="Account portal type">
            <button
              type="button"
              role="tab"
              aria-selected={!isSuperadmin}
              className={`portal-pill ${!isSuperadmin ? 'is-active' : ''}`}
              onClick={() => handlePortalSwitch('member')}
            >
              {!isSuperadmin && (
                <motion.span
                  layoutId="portalPillBg"
                  className="portal-pill-bg"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="portal-pill-label">
                <UserCheck size={15} /> Member / Organizer
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={isSuperadmin}
              className={`portal-pill ${isSuperadmin ? 'is-active is-admin-tab' : ''}`}
              onClick={() => handlePortalSwitch('superadmin')}
            >
              {isSuperadmin && (
                <motion.span
                  layoutId="portalPillBg"
                  className="portal-pill-bg is-admin-bg"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="portal-pill-label">
                <ShieldAlert size={15} /> Superadmin
              </span>
            </button>
          </div>

          <div className="auth-header">
            <span className="auth-eyebrow">
              {isSuperadmin ? 'Restricted Console' : 'Vijayawada City Voice'}
            </span>
            <h1>{isSuperadmin ? 'Admin Access' : 'Welcome Back'}</h1>
            <p>
              {isSuperadmin
                ? 'Authorized platform administrators only.'
                : 'Sign in to RSVP, manage clubs & host events.'}
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                className="auth-error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {!isSuperadmin && (
            <div className="auth-method-tabs" role="tablist" aria-label="Sign in method">
              <button
                type="button"
                role="tab"
                aria-selected={loginMethod === 'password'}
                className={`auth-method-tab ${loginMethod === 'password' ? 'is-active' : ''}`}
                onClick={() => { setLoginMethod('password'); setOtpSent(false); setError(''); }}
              >
                {loginMethod === 'password' && (
                  <motion.span
                    layoutId="authMethodBg"
                    className="auth-method-bg"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="auth-method-label">Password</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={loginMethod === 'otp'}
                className={`auth-method-tab ${loginMethod === 'otp' ? 'is-active' : ''}`}
                onClick={() => { setLoginMethod('otp'); setError(''); }}
              >
                {loginMethod === 'otp' && (
                  <motion.span
                    layoutId="authMethodBg"
                    className="auth-method-bg"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="auth-method-label">Email OTP</span>
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {isSuperadmin || loginMethod === 'password' ? (
              <motion.form
                key={`password-form-${portalMode}`}
                onSubmit={handlePasswordLogin}
                className="auth-form"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.2 }}
              >
                <div className="input-group">
                  <label htmlFor="login-email"><Mail size={14} /> Email Address</label>
                  <input
                    id="login-email"
                    type="email"
                    placeholder={isSuperadmin ? 'admin@clubhub.in' : 'name@example.com'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="login-password"><Lock size={14} /> Password</label>
                  <div className="password-input-wrap">
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(s => !s)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {!isSuperadmin && (
                    <div className="forgot-link-row">
                      <Link to="/forgot-password">Forgot Password?</Link>
                    </div>
                  )}
                </div>
                <button type="submit" className={`auth-submit ${isSuperadmin ? 'is-admin-submit' : ''}`} disabled={loading}>
                  {loading
                    ? 'Authenticating...'
                    : (isSuperadmin ? <>Enter Admin Console <ArrowRight size={18} /></> : <>Login <ArrowRight size={18} /></>)}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="otp-form"
                onSubmit={otpSent ? handleVerifyOtp : handleRequestOtp}
                className="auth-form"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.2 }}
              >
                <div className="input-group">
                  <label htmlFor="otp-email"><Mail size={14} /> Email Address</label>
                  <input
                    id="otp-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={otpSent}
                    required
                  />
                </div>

                {otpSent && (
                  <motion.div
                    className="input-group"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <div className="otp-label-row">
                      <label htmlFor="otp-code"><KeyRound size={14} /> Enter 6-Digit OTP</label>
                      <button
                        type="button"
                        className="otp-change-email-btn"
                        onClick={() => { setOtpSent(false); setOtp(''); setError(''); }}
                      >
                        <ArrowLeft size={13} /> Change email
                      </button>
                    </div>
                    <input
                      id="otp-code"
                      type="text"
                      inputMode="numeric"
                      placeholder="123456"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="otp-code-input"
                      required
                    />
                  </motion.div>
                )}

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading
                    ? 'Processing...'
                    : (otpSent ? <>Verify & Login <ArrowRight size={18} /></> : <>Send OTP Code <ArrowRight size={18} /></>)}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {!isSuperadmin && (
            <p className="auth-footer">
              New here? <Link to="/register">Create an account</Link>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
