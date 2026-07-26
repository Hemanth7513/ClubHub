import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, PlusCircle, LogIn, LogOut, User, Menu, X, Calendar, HelpCircle, LayoutDashboard, MapPin, ShieldAlert, Settings, TicketIcon } from 'lucide-react';
import Button from '../Button/Button';
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react';
import logo from '../../assets/images/logo.png';
import './Header.css';

const Header = () => {
  const { user, isLoaded } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

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

            {!isLoaded ? (
              <div className="auth-buttons" style={{ opacity: 0 }}>
                <Button>Loading</Button>
              </div>
            ) : (
              <>
                <SignedIn>
                  <div className="user-dropdown-container" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {user?.publicMetadata?.role === 'admin' ? (
                      <Link to="/admin" className="dropdown-item admin-item" onClick={() => setIsMenuOpen(false)}>
                        <ShieldAlert size={16} /> Admin
                      </Link>
                    ) : (
                      <Link to="/dashboard" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                        <TicketIcon size={16} /> My Tickets
                      </Link>
                    )}
                    <UserButton />
                  </div>
                </SignedIn>
                <SignedOut>
                  <div className="auth-buttons">
                    <SignInButton mode="modal">
                      <button className="login-btn">
                        <LogIn size={18} style={{ marginRight: '6px' }} /> Login
                      </button>
                    </SignInButton>
                  </div>
                </SignedOut>
              </>
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
