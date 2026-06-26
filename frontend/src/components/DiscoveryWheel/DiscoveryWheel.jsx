import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import './DiscoveryWheel.css';

const DiscoveryWheel = ({ categories, clubs, onSelect }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % categories.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + categories.length) % categories.length);
  };

  const handleDragEnd = (e, { offset, velocity }) => {
    const swipe = offset.x + velocity.x * 0.5;
    if (swipe < -50) {
      handleNext();
    } else if (swipe > 50) {
      handlePrev();
    }
  };

  return (
    <div className="discovery-wheel-outer">
      <div className="discovery-wheel-container-3d">
        <div className="carousel-controls">
          <button onClick={handlePrev} className="carousel-btn prev-btn"><ChevronLeft /></button>
          <button onClick={handleNext} className="carousel-btn next-btn"><ChevronRight /></button>
        </div>
        
        <motion.div 
          className="discovery-wheel-track-3d"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
        >
          <AnimatePresence initial={false}>
            {categories.map((cat, i) => {
              // Calculate relative position based on a circle
              const diff = (i - currentIndex + categories.length) % categories.length;
              // Map diff to -2, -1, 0, 1, 2 depending on length
              let offset = diff;
              if (offset > Math.floor(categories.length / 2)) {
                offset -= categories.length;
              }

              // Visual properties based on offset
              const isCenter = offset === 0;
              const zIndex = 100 - Math.abs(offset);
              const scale = isCenter ? 1 : Math.max(0.7, 1 - Math.abs(offset) * 0.15);
              const translateX = `${offset * 75}%`; // 75% of card width for good overlap
              const rotateY = `${-offset * 15}deg`; // slightly turn inwards
              const opacity = Math.abs(offset) > 2 ? 0 : isCenter ? 1 : 0.6;
              const pointerEvents = Math.abs(offset) > 2 ? 'none' : 'auto';

              return (
                <motion.div
                  key={cat.name}
                  className={`wheel-card-3d ${isCenter ? 'active' : ''}`}
                  onClick={() => isCenter ? onSelect(cat.name) : setCurrentIndex(i)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    x: translateX, 
                    scale, 
                    rotateY, 
                    zIndex, 
                    opacity,
                    y: isCenter ? [0, -5, 0] : 0
                  }}
                  transition={{ 
                    duration: 0.4, 
                    ease: "easeInOut",
                    y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                  }}
                  style={{ 
                    '--accent': cat.color,
                    pointerEvents
                  }}
                  whileHover={isCenter ? { scale: 1.02, y: -10, transition: { duration: 0.2 } } : {}}
                  whileTap={isCenter ? { scale: 0.98 } : {}}
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
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
      
      <div className="wheel-hint">
        <span>Swipe or Click to Explore</span>
      </div>
    </div>
  );
};

export default DiscoveryWheel;
