import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, PlusCircle, LogIn, LogOut, User, Menu, X, Calendar, HelpCircle, Sun, Moon, LayoutDashboard } from 'lucide-react';
import Button from '../Button/Button';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import logo from '../../assets/images/logo.png';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
        <Link to="/" className="logo">
          <img src={logo} alt="ClubHub" className="logo-img" />
          <span className="text-gradient">ClubHub</span>
        </Link>

        {/* Desktop Nav */}
        <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <div className="nav-links">
            <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              <Users size={18} /> Directory
            </Link>
            <Link to="/events" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              <Calendar size={18} /> Events
            </Link>
            <Link to="/support" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              <HelpCircle size={18} /> Support
            </Link>
            
            <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Dark Mode">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <>
                <Link to="/add-club" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  <PlusCircle size={18} /> Add Club
                </Link>
                <Link to="/dashboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
                <div className="user-profile">
                  <Link to="/settings" className="user-profile-link" onClick={() => setIsMenuOpen(false)}>
                    <User size={18} />
                    <span className="user-name">{user.name}</span>
                  </Link>
                  <button onClick={handleLogout} className="logout-btn" title="Logout">
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="primary" size="small">
                  <LogIn size={18} /> Login
                </Button>
              </Link>
            )}
          </div>
        </nav>

        {/* Mobile Toggle */}
        <button className="mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
