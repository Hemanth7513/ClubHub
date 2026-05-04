import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE_URL from '../config';
import './AuthPages.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-header">
          <h1 className="text-gradient">Join the Hub</h1>
          <p>Create your profile and start connecting.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleRegister} className="auth-form">
          <div className="input-group">
            <label><User size={16} /> Full Name</label>
            <input 
              type="text" 
              placeholder="John Doe" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required 
            />
          </div>
          <div className="input-group">
            <label><Mail size={16} /> Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required 
            />
          </div>
          <div className="input-group">
            <label><Lock size={16} /> Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required 
            />
          </div>
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Creating Account...' : (
              <>Register <ArrowRight size={20} /></>
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
