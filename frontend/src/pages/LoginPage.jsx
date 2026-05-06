import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE_URL from '../config';
import './AuthPages.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
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

          <form onSubmit={handleLogin} className="auth-form">
            <div className="input-group">
              <label><Mail size={14} /> Email Address</label>
              <input 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="input-group">
              <label><Lock size={14} /> Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Authenticating...' : (<>Login Now <ArrowRight size={18} /></>)}
            </button>
          </form>

          <p className="auth-footer">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
