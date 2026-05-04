import React from 'react';
import './Footer.css';

import { Link } from 'react-router-dom';

const Footer = () => {
  return (
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
              <Link to="/">Directory</Link>
              <Link to="/events">Events</Link>
              <Link to="/">Categories</Link>
            </div>
            <div className="footer-group">
              <h4>Support</h4>
              <Link to="/support">Help Center</Link>
              <Link to="/support">Terms of Service</Link>
              <Link to="/support">Privacy Policy</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} ClubHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
