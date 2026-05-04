import React from 'react';
import './Marquee.css';

const Marquee = ({ text, speed = 20, direction = 'left' }) => {
  return (
    <div className="marquee-container">
      <div className={`marquee-content ${direction}`} style={{ animationDuration: `${speed}s` }}>
        {[...Array(10)].map((_, i) => (
          <span key={i} className="marquee-text">
            {text} <span className="marquee-bullet">•</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
