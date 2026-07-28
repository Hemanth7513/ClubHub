import React from 'react';
import { motion } from 'framer-motion';
import { Ticket, Music, MapPin, Calendar, Star, Sparkles, Heart, Zap } from 'lucide-react';
import logo from '../../assets/images/logo.png';
import './SplashScreen.css';

const floatingIcons = [
  { id: 1, Icon: Ticket, color: '#ff2e63', size: 48, top: '15%', left: '10%' },
  { id: 2, Icon: Music, color: '#08d9d6', size: 56, top: '20%', left: '80%' },
  { id: 3, Icon: MapPin, color: '#ccff00', size: 42, top: '70%', left: '15%' },
  { id: 4, Icon: Calendar, color: '#ff2e63', size: 50, top: '80%', left: '75%' },
  { id: 5, Icon: Star, color: '#f9a826', size: 60, top: '40%', left: '5%' },
  { id: 6, Icon: Sparkles, color: '#08d9d6', size: 45, top: '50%', left: '85%' },
  { id: 7, Icon: Heart, color: '#ff2e63', size: 38, top: '10%', left: '50%' },
  { id: 8, Icon: Zap, color: '#ccff00', size: 55, top: '85%', left: '45%' },
];

const SplashScreen = () => {
  return (
    <motion.div 
      className="splash-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="splash-background-icons">
        {floatingIcons.map((item, index) => (
          <motion.div
            key={item.id}
            className="splash-icon-wrapper"
            style={{ top: item.top, left: item.left, color: item.color }}
            initial={{ opacity: 0, scale: 0, y: 50, rotate: -30 }}
            animate={{ 
              opacity: 0.7, 
              scale: 1, 
              y: [0, -30, 0],
              rotate: [0, 15, -15, 0]
            }}
            transition={{ 
              opacity: { duration: 0.5, delay: index * 0.1 },
              scale: { duration: 0.5, type: 'spring', delay: index * 0.1 },
              y: { duration: 3 + index * 0.5, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 4 + index * 0.5, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <item.Icon size={item.size} strokeWidth={2} />
          </motion.div>
        ))}
      </div>
      
      <div className="splash-logo-container">
        <motion.img 
          layoutId="main-logo"
          src={logo} 
          alt="ClubHub Logo" 
          className="splash-logo"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring', damping: 15, stiffness: 100 }}
        />
      </div>
    </motion.div>
  );
};

export default SplashScreen;
