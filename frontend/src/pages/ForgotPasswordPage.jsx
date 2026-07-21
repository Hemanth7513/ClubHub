import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../config';
import './AuthPages.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const contentType = res.headers.get("content-type");
      let data = null;
      
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error('Received an HTML response instead of JSON. The backend server might be offline or unreachable.');
      }
      
      if (!res.ok) throw new Error(data?.error || 'Request failed');
      
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-panel">
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <h1 style={{ color: 'var(--border-dark)', marginBottom: '1rem' }}>Check Your Email</h1>
            <p style={{ marginBottom: '2rem' }}>If this email is registered, a password reset link has been sent.</p>
            <Link to="/login" className="auth-submit" style={{ textDecoration: 'none' }}>
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            <span className="auth-eyebrow">Recovery</span>
            <h1>Forgot Password</h1>
            <p>Enter your email to receive a reset link.</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label><Mail size={14} /> Email Address</label>
              <input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Sending...' : (<>Send Reset Link <ArrowRight size={18} /></>)}
            </button>
          </form>

          <p className="auth-footer" style={{ marginTop: '1.5rem' }}>
            Remembered your password? <Link to="/login">Back to Login</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
