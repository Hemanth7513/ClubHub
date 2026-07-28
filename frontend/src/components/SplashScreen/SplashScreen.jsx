import React from 'react';
import { motion } from 'framer-motion';
import logo from '../../assets/images/logo.png';
import './SplashScreen.css';

const SplashScreen = () => {
  return (
    <div className="splash-screen">
      <motion.img 
        layoutId="main-logo"
        src={logo} 
        alt="ClubHub Logo" 
        className="splash-logo"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: 'spring', damping: 20, stiffness: 100 }}
      />
    </div>
  );
};

export default SplashScreen;
