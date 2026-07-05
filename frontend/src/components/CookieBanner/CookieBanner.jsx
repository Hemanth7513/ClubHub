import React, { useState, useEffect } from 'react';
import './CookieBanner.css';
import Button from '../Button/Button';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('clubhub_cookie_consent');
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('clubhub_cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner-overlay glass-panel">
      <div className="cookie-banner-content">
        <p>
          <strong>We value your privacy.</strong> ClubHub uses cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
        </p>
        <div className="cookie-banner-actions">
          <Button variant="primary" onClick={acceptCookies}>Accept All</Button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
