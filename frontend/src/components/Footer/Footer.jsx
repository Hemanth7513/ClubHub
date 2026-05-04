import React from 'react';
import './Footer.css';

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
              <a href="#">Directory</a>
              <a href="#">Events</a>
              <a href="#">Categories</a>
            </div>
            <div className="footer-group">
              <h4>Support</h4>
              <a href="#">Help Center</a>
              <a href="#">Terms of Service</a>
              <a href="#">Privacy Policy</a>
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
