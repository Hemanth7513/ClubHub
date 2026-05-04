import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Globe } from 'lucide-react';
import './DiscoveryWheel.css';

const DiscoveryWheel = ({ categories, clubs, onSelect }) => {
  return (
    <div className="discovery-wheel-outer">
      <div className="discovery-wheel-container">
        <motion.div 
          className="discovery-wheel-track"
          drag="x"
          dragConstraints={{ left: -1500, right: 0 }}
          style={{ perspective: 1200 }}
        >
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              className="wheel-card"
              onClick={() => onSelect(cat.name)}
              whileHover={{ scale: 1.05, y: -15, rotateY: 5 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, rotateY: 45, x: 100 }}
              whileInView={{ opacity: 1, rotateY: 0, x: 0 }}
              viewport={{ once: true }}
              transition={{ 
                delay: i * 0.05,
                type: "spring",
                stiffness: 100,
                damping: 20
              }}
              style={{ '--accent': cat.color }}
            >
              <div className="wheel-card-inner glass-panel">
                <div className="wheel-icon-box">
                  <span className="wheel-icon">{cat.icon}</span>
                </div>
                <h3>{cat.name}</h3>
                <p>{cat.desc}</p>
                <div className="wheel-footer">
                  <span className="count-badge">
                    {clubs.filter(c => c.category === cat.name).length} Orgs
                  </span>
                  <Globe size={18} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      <div className="wheel-hint">
        <span>Drag to Explore</span>
        <div className="scroll-indicator">
          <motion.div 
            className="indicator-dot"
            animate={{ x: [0, 40, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
};

export default DiscoveryWheel;
