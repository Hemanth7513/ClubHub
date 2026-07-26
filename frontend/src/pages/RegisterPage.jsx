import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE_URL from '../config';
import './AuthPages.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
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
            <h1>Join the Hub</h1>
            <p>Create your profile and start connecting with your city.</p>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-error" style={{ background: 'var(--accent-lime)', color: '#1a1a1a', borderColor: 'var(--border-dark)' }}>{success}</div>}

          <form onSubmit={handleRegister} className="auth-form">
            <div className="input-group">
              <label><User size={14} /> Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required 
                maxLength={50}
              />
            </div>
            <div className="input-group">
              <label><Mail size={14} /> Email Address</label>
              <input 
                type="email" 
                placeholder="name@example.com" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required 
                maxLength={100}
              />
            </div>
            <div className="input-group">
              <label><Lock size={14} /> Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required 
                  minLength={6}
                  maxLength={100}
                  style={{ width: '100%', paddingRight: '40px' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', display: 'flex' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" className="auth-submit" disabled={loading || !!success}>
              {loading ? 'Creating Account...' : (<>Create Account <ArrowRight size={18} /></>)}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
