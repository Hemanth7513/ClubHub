import React from 'react';
import './Footer.css';

import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <>
      <div className="marquee-container">
        <div className="marquee-content">
          VIJAYAWADA CITY VOICE • DISCOVER COMMUNITIES • JOIN CLUBS • ATTEND EVENTS • CONNECT & THRIVE • VIJAYAWADA CITY VOICE • DISCOVER COMMUNITIES • JOIN CLUBS • ATTEND EVENTS • CONNECT & THRIVE • 
        </div>
      </div>
      <footer className="footer glass-panel">
        <div className="container footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3 className="text-gradient">ClubHub</h3>
            <p>Discover, connect, and thrive in your local communities.</p>
          </div>
          <div className="footer-links">
            <div className="footer-group">
              <h4>Platform</h4>
              <Link to="/" onClick={() => window.scrollTo(0, 0)}>Directory</Link>
              <Link to="/events" onClick={() => window.scrollTo(0, 0)}>Events</Link>
              <Link to="/#categories" onClick={() => window.scrollTo(0, 0)}>Categories</Link>
            </div>
            <div className="footer-group">
              <h4>Support</h4>
              <Link to="/support#help" onClick={() => window.scrollTo(0, 0)}>Help Center</Link>
              <Link to="/support#terms" onClick={() => window.scrollTo(0, 0)}>Terms of Service</Link>
              <Link to="/support#privacy" onClick={() => window.scrollTo(0, 0)}>Privacy Policy</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} ClubHub. All rights reserved.</p>
        </div>
      </div>
      </footer>
    </>
  );
};

export default Footer;
