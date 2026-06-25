import React from 'react';
import { motion } from 'framer-motion';
import useMagnetic from '../../hooks/useMagnetic';
import './Button.css';

const Button = ({ children, variant = 'primary', size = 'medium', className = '', ...props }) => {
  const { handleMouseMove, handleMouseLeave, style } = useMagnetic(0.2, 50);

  return (
    <motion.button 
      className={`btn btn-${variant} btn-${size} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      whileTap={{ 
        scale: 0.96, 
        y: 4, 
        x: 4,
        boxShadow: "0px 0px 0px var(--border-dark)" 
      }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
