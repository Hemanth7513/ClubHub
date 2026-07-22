/* eslint-disable */
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';
import './NotFoundPage.css';

const NotFoundPage = () => {
  return (
    <div className="not-found-page container">
      <motion.div 
        className="not-found-content glass-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <AlertTriangle size={80} className="not-found-icon" />
        <h1 className="title-xl text-gradient-animated">404</h1>
        <h2>Page Not Found</h2>
        <p>The community space you're looking for doesn't exist or has been moved.</p>
        
        <Link to="/" className="home-link-btn">
          <Home size={18} /> Return to Directory
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
