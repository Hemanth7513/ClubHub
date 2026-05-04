import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

const AnimatedDancer = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e) => {
    const { innerWidth, innerHeight } = window;
    mouseX.set(e.clientX / innerWidth - 0.5);
    mouseY.set(e.clientY / innerHeight - 0.5);
  };

  React.useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const x = useTransform(mouseX, [-0.5, 0.5], [-30, 30]);
  const y = useTransform(mouseY, [-0.5, 0.5], [-30, 30]);

  return (
    <motion.div
      className="ambience-asset dancer-asset"
      style={{
        position: 'absolute',
        left: '-8%',
        top: '15%',
        zIndex: 5,
        width: '350px',
        pointerEvents: 'none',
        x,
        y
      }}
    >
      <motion.img
        src="/premium_genz_dancer_3d_1777823683932.png"
        alt="Premium Dancer"
        style={{
          width: '100%',
          height: 'auto',
          filter: 'drop-shadow(20px 20px 40px rgba(0,0,0,0.15))'
        }}
        animate={{
          rotate: [0, 2, -2, 0],
          scale: [1, 1.02, 0.98, 1]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
};

export default AnimatedDancer;
