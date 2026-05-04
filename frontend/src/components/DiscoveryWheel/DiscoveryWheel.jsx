import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Globe } from 'lucide-react';
import './DiscoveryWheel.css';

const DiscoveryWheel = ({ categories, clubs, onSelect }) => {
  const containerRef = useRef(null);
  const { scrollXProgress } = useScroll({
    container: containerRef,
    axis: 'x'
  });

  return (
    <div className="discovery-wheel-outer">
      <div className="discovery-wheel-container" ref={containerRef}>
        <div className="discovery-wheel-track">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              className="wheel-card"
              onClick={() => onSelect(cat.name)}
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
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
                  <Globe size={18} className="pulse-icon-small" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="wheel-hint">
        <span>Scroll to Explore</span>
        <div className="scroll-indicator">
          <motion.div 
            className="indicator-dot"
            animate={{ x: [0, 20, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </div>
    </div>
  );
};

export default DiscoveryWheel;
