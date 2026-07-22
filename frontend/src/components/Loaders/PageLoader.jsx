import React from 'react';
import { motion } from 'framer-motion';
import './PageLoader.css';

const PageLoader = () => {
  return (
    <div className="page-loader-container">
      {/* Animated Background Orb */}
      <motion.div
        className="loader-orb loader-orb-primary"
        animate={{
          scale: [1, 1.8, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, 30, 0],
          y: [0, -30, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="loader-orb loader-orb-secondary"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.5, 0.2],
          x: [0, -40, 0],
          y: [0, 40, 0]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      />

      {/* Main Loader Content */}
      <div className="loader-content">
        <motion.div 
          className="loader-logo-container"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          {/* A cool geometric shape or ring */}
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.circle 
              cx="30" cy="30" r="28" 
              stroke="url(#paint0_linear)" 
              strokeWidth="4" 
              strokeDasharray="40 100"
              strokeLinecap="round"
              animate={{ strokeDashoffset: [0, 140] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <defs>
              <linearGradient id="paint0_linear" x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7b61ff" />
                <stop offset="1" stopColor="#00d2ff" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        <motion.div
          className="loader-text-wrapper"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        >
          <span className="loader-gradient-text">CLUBHUB</span>
        </motion.div>
      </div>
    </div>
  );
};

export default PageLoader;
