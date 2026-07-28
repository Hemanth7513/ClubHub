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
  const [emailError, setEmailError] = useState(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: 'transparent' });
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setEmailError(null);
      return;
    }
    const timer = setTimeout(async () => {
      setCheckingEmail(true);
      try {
        const res = await fetch(`${API_BASE_URL}/auth/check-email?email=${encodeURIComponent(formData.email)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.exists) {
            setEmailError('This email is already registered. Please log in.');
          } else {
            setEmailError(null);
          }
        }
      } catch (err) {
        console.error('Failed to check email', err);
      } finally {
        setCheckingEmail(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.email]);

  const checkPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length > 7) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    if (pwd.length === 0) setPasswordStrength({ score: 0, text: '', color: 'transparent' });
    else if (score < 2) setPasswordStrength({ score, text: 'Weak', color: '#ff4d4f' });
    else if (score === 2) setPasswordStrength({ score, text: 'Fair', color: '#faad14' });
    else if (score === 3) setPasswordStrength({ score, text: 'Good', color: '#52c41a' });
    else setPasswordStrength({ score, text: 'Strong', color: 'var(--accent-lime)' });
  };

  React.useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (emailError) return;
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
                style={{ borderColor: emailError ? '#ff4d4f' : '' }}
              />
              {checkingEmail && <span style={{fontSize:'0.75rem', color:'var(--text-secondary)', marginTop:'4px', display:'block'}}>Checking email...</span>}
              {emailError && <span style={{fontSize:'0.75rem', color:'#ff4d4f', marginTop:'4px', display:'block'}}>{emailError}</span>}
            </div>
            <div className="input-group">
              <label><Lock size={14} /> Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({...formData, password: e.target.value});
                    checkPasswordStrength(e.target.value);
                  }}
                  required 
                  minLength={8}
                  maxLength={100}
                  style={{ width: '100%', paddingRight: '40px' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', display: 'flex' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formData.password.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', height: '4px', width: '100%' }}>
                    {[1, 2, 3, 4].map((level) => (
                      <div key={level} style={{ flex: 1, backgroundColor: passwordStrength.score >= level ? passwordStrength.color : 'rgba(255,255,255,0.1)', borderRadius: '2px', transition: 'background 0.3s' }} />
                    ))}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: passwordStrength.color, marginTop: '4px', fontWeight: 700 }}>
                    {passwordStrength.text} Password
                  </div>
                </div>
              )}
            </div>
            <button type="submit" className="auth-submit" disabled={loading || checkingEmail || !!emailError}>
              {loading ? 'Creating account...' : (
                <>Create Account <ArrowRight size={16} /></>
              )}
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
