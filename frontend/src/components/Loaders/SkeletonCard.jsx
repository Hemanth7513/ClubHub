import React from 'react';
import { motion } from 'framer-motion';
import './SkeletonCard.css';

const SkeletonCard = () => {
  return (
    <motion.div 
      className="skeleton-card glass-panel"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="skeleton-image pulse"></div>
      <div className="skeleton-content">
        <div className="skeleton-title pulse"></div>
        <div className="skeleton-line pulse"></div>
        <div className="skeleton-line pulse" style={{ width: '80%' }}></div>
        <div className="skeleton-line pulse" style={{ width: '60%' }}></div>
        
        <div className="skeleton-footer">
          <div className="skeleton-button pulse"></div>
        </div>
      </div>
    </motion.div>
  );
};

export default SkeletonCard;
