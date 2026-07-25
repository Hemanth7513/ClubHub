import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, PlusCircle, LogIn, LogOut, User, Menu, X, Calendar, HelpCircle, LayoutDashboard, MapPin, ShieldAlert } from 'lucide-react';
import { Users, PlusCircle, LogIn, LogOut, User, Menu, X, Calendar, HelpCircle, LayoutDashboard, MapPin, ShieldAlert, Settings } from 'lucide-react';
import Button from '../Button/Button';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/images/logo.png';
import './Header.css';

const Header = () => {
  const { user, logout, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="header sticky-header">
      <div className="container header-container">
        <a href="/" className="logo">
          <img src={logo} alt="ClubHub" className="logo-img" />
        </a>

        {/* Desktop Nav */}
        <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <div className="nav-links">
            <Link to="/#categories" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              <Users size={18} /> Directory
            </Link>
            <Link to="/map" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              <MapPin size={18} /> Map
            </Link>
            <Link to="/events" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              <Calendar size={18} /> Events
            </Link>
            <Link to="/support" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              <HelpCircle size={18} /> Support
            </Link>

            {loading ? (
              <div className="auth-buttons" style={{ opacity: 0 }}>
                {/* Invisible placeholder to prevent layout shift */}
                <Button>Loading</Button>
              </div>
            ) : user ? (
              <div className="user-dropdown-container">
                <div className="user-profile">
                  <User size={18} />
                  <span className="user-name">{user.name}</span>
                </div>
                <div className="dropdown-menu">
                  <Link to="/dashboard" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link to="/add-club" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                    <PlusCircle size={16} /> Add Club
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="dropdown-item admin-item" onClick={() => setIsMenuOpen(false)}>
                      <ShieldAlert size={16} /> Owner Panel
                    </Link>
                  )}
                  <Link to="/settings" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                    <Settings size={16} /> Settings
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item logout-item">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="login-btn" onClick={() => setIsMenuOpen(false)}>
                  <LogIn size={18} /> Login
                </Link>
                <Button onClick={() => { navigate('/register'); setIsMenuOpen(false); }}>
                  Register
                </Button>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Menu Toggle */}
        <button className="mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
