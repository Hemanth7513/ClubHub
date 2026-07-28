import React from 'react';
import './Footer.css';

import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <>
      <div className="marquee-container">
        <div className="marquee-content">
          VIJAYAWADA CITY VOICE &nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;&nbsp; DISCOVER COMMUNITIES &nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;&nbsp; JOIN CLUBS &nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;&nbsp; ATTEND EVENTS &nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;&nbsp; CONNECT &amp; THRIVE &nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;&nbsp; VIJAYAWADA CITY VOICE &nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;&nbsp; DISCOVER COMMUNITIES &nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;&nbsp; JOIN CLUBS &nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;&nbsp; ATTEND EVENTS &nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;&nbsp; CONNECT &amp; THRIVE &nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;&nbsp;
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
              <Link to="/support#refund" onClick={() => window.scrollTo(0, 0)}>Refund Policy</Link>
              <Link to="/support#contact" onClick={() => window.scrollTo(0, 0)}>Contact Us</Link>
            </div>
            <div className="footer-group">
              <h4>Connect</h4>
              <a href="https://www.instagram.com/clubhub.vja/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg> Instagram
              </a>
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
