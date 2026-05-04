import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star, Heart, Circle } from 'lucide-react';
import './Floaties.css';

const icons = [Sparkles, Star, Heart, Circle];

const Floaties = () => {
  return (
    <div className="floaties-container">
      {[...Array(12)].map((_, i) => {
        const Icon = icons[i % icons.length];
        const size = Math.random() * 20 + 10;
        const duration = Math.random() * 20 + 20;
        const delay = Math.random() * 10;

        return (
          <motion.div
            key={i}
            className="floaty-icon"
            initial={{ 
              x: `${Math.random() * 100}vw`, 
              y: `${Math.random() * 100}vh`,
              opacity: 0 
            }}
            animate={{ 
              y: ['0vh', '100vh'],
              x: [`${Math.random() * 100}vw`, `${Math.random() * 100}vw`],
              rotate: [0, 360],
              opacity: [0, 0.2, 0]
            }}
            transition={{ 
              duration: duration,
              repeat: Infinity,
              delay: delay,
              ease: "linear"
            }}
            style={{ position: 'fixed' }}
          >
            <Icon size={size} strokeWidth={1} />
          </motion.div>
        );
      })}
    </div>
  );
};

export default Floaties;
