import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Zap, Calendar } from 'lucide-react';
import './SocialPulse.css';

const InstagramIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const TwitterIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);

const MOCK_EVENTS = [
  { club: 'Rotary Vijayawada', platform: 'Instagram', text: 'Preparing for the beach cleanup this Sunday! 🌊', time: '2h ago' },
  { club: 'Young Leaders Hub', platform: 'Twitter', text: 'Our next networking mixer is live! RSVP now. 🚀', time: '5h ago' },
  { club: 'VJA Sports Club', platform: 'Instagram', text: 'Tournament bracket finalized. Let the games begin! 🏆', time: '1d ago' },
];

const SocialPulse = () => {
  const [activeEvent, setActiveEvent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveEvent((prev) => (prev + 1) % MOCK_EVENTS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="social-pulse-container">
      <div className="pulse-header">
        <Zap size={20} className="pulse-icon-live" />
        <span className="pulse-label">LIVE SOCIAL PULSE</span>
        <div className="pulse-searching">
          <div className="searching-dot"></div>
          Searching Instagram & Twitter...
        </div>
      </div>

      <div className="pulse-content">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeEvent}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="pulse-event-card"
          >
            <div className="event-source">
              {MOCK_EVENTS[activeEvent].platform === 'Instagram' ? <InstagramIcon size={16} /> : <TwitterIcon size={16} />}
              <span className="event-club">{MOCK_EVENTS[activeEvent].club}</span>
            </div>
            <p className="event-text">"{MOCK_EVENTS[activeEvent].text}"</p>
            <div className="event-footer">
              <Calendar size={14} />
              <span>{MOCK_EVENTS[activeEvent].time}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <button className="pulse-search-btn">
        <Search size={16} /> Search for more local events
      </button>
    </div>
  );
};

export default SocialPulse;
