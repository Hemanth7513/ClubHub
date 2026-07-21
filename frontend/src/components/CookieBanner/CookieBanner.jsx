import React, { useState, useEffect } from 'react';
import './CookieBanner.css';
import Button from '../Button/Button';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('clubhub_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('clubhub_cookie_consent', 'true');
    setIsVisible(false);
  };

  const declineCookies = () => {
    // Dismiss without storing consent — will show again next session
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner-overlay glass-panel" role="dialog" aria-label="Cookie consent">
      <div className="cookie-banner-content">
        <p>
          <strong>We use cookies.</strong> ClubHub uses cookies to enhance your browsing experience and analyze our traffic. By clicking "Accept", you consent to our use of cookies.
        </p>
        <div className="cookie-banner-actions">
          <Button variant="secondary" onClick={declineCookies}>Decline</Button>
          <Button variant="primary" onClick={acceptCookies}>Accept</Button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
