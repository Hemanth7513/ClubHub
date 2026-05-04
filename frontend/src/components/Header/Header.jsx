import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, PlusCircle, LogIn, LogOut, User, Menu, X } from 'lucide-react';
import Button from '../Button/Button';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/images/logo.png';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            {user ? (
              <>
                <Link to="/add-club" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  <PlusCircle size={18} /> Add Club
                </Link>
                <div className="user-profile">
                  <User size={18} />
                  <span className="user-name">{user.name}</span>
                  <button onClick={logout} className="logout-btn">
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
