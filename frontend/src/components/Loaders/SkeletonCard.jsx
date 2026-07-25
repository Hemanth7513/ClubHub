import React from 'react';
import { motion } from 'framer-motion';
import './SkeletonCard.css';

const SkeletonCard = ({ index = 0 }) => {
  return (
    <motion.div
      className="skeleton-card glass-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (index % 3) * 0.1 }}
    >
      <div className="skeleton-image skeleton-pulse" />
      <div className="skeleton-content">
        <div className="skeleton-title skeleton-pulse" />
        <div className="skeleton-desc skeleton-pulse" />
        <div className="skeleton-desc short skeleton-pulse" />
        
        <div className="skeleton-meta">
          <div className="skeleton-meta-item skeleton-pulse" />
          <div className="skeleton-meta-item skeleton-pulse" />
        </div>

        <div className="skeleton-actions">
          <div className="skeleton-btn skeleton-pulse" />
          <div className="skeleton-btn skeleton-pulse" />
        </div>
      </div>
    </motion.div>
  );
};

export default SkeletonCard;
