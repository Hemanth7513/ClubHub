/* eslint-disable */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Mail, Lock, ArrowRight, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import API_BASE_URL from '../config';
import './AuthPages.css';

const LoginPage = () => {
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => { window.scrollTo(0, 0); }, []);

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
      
      const contentType = res.headers.get("content-type");
      let data = null;
      
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        throw new Error('Received an HTML response instead of JSON. The backend server might be offline or unreachable.');
      }

      if (!res.ok) throw new Error(data?.error || 'Login failed');

      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email first.");
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request OTP');
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (tokenResponse) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google login failed');
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <motion.div 
          className="auth-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="auth-header">
            <span className="auth-eyebrow">Vijayawada City Voice</span>
            <h1>Welcome Back</h1>
            <p>Sign in to register clubs & manage your community.</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <div className="auth-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
            <button 
              className={`auth-tab ${loginMethod === 'password' ? 'active' : ''}`}
              onClick={() => { setLoginMethod('password'); setOtpSent(false); setError(''); }}
              style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: loginMethod === 'password' ? 'var(--bg-lighter)' : 'transparent', color: 'var(--text-main)' }}
            >
              Password
            </button>
            <button 
              className={`auth-tab ${loginMethod === 'otp' ? 'active' : ''}`}
              onClick={() => { setLoginMethod('otp'); setError(''); }}
              style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: loginMethod === 'otp' ? 'var(--bg-lighter)' : 'transparent', color: 'var(--text-main)' }}
            >
              Email OTP
            </button>
          </div>

          <AnimatePresence mode="wait">
            {loginMethod === 'password' ? (
              <motion.form 
                key="password-form"
                onSubmit={handlePasswordLogin} 
                className="auth-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="input-group">
                  <label><Mail size={14} /> Email Address</label>
                  <input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label><Lock size={14} /> Password</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', paddingRight: '40px' }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', display: 'flex' }}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                    <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--accent-pink)', textDecoration: 'none', fontWeight: '600' }}>Forgot Password?</Link>
                  </div>
                </div>
                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? 'Authenticating...' : (<>Login <ArrowRight size={18} /></>)}
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="otp-form"
                onSubmit={otpSent ? handleVerifyOtp : handleRequestOtp} 
                className="auth-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="input-group">
                  <label><Mail size={14} /> Email Address</label>
                  <input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={otpSent} required />
                </div>
                
                {otpSent && (
                  <motion.div className="input-group" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label><KeyRound size={14} /> Enter 6-Digit OTP</label>
                    <input type="text" placeholder="123456" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} style={{ letterSpacing: '4px', fontSize: '1.2rem', textAlign: 'center' }} required />
                  </motion.div>
                )}

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? 'Processing...' : (otpSent ? <>Verify & Login <ArrowRight size={18} /></> : <>Send OTP Code</>)}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
              <span style={{ padding: '0 10px', color: 'var(--text-light)', fontSize: '0.9rem' }}>OR CONTINUE WITH</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <GoogleLogin 
                onSuccess={handleGoogleLoginSuccess} 
                onError={() => setError("Google login failed.")} 
                shape="rectangular"
                theme="outline"
                size="large"
              />
            </div>
          </div>

          <p className="auth-footer" style={{ marginTop: '1.5rem' }}>
            New here? <Link to="/register">Create an account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
