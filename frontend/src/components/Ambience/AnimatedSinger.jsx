import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

const AnimatedSinger = () => {
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

  const x = useTransform(mouseX, [-0.5, 0.5], [40, -40]);
  const y = useTransform(mouseY, [-0.5, 0.5], [40, -40]);

  return (
    <motion.div
      className="ambience-asset singer-asset"
      style={{
        position: 'absolute',
        right: '-8%',
        top: '35%',
        zIndex: 5,
        width: '380px',
        pointerEvents: 'none',
        x,
        y
      }}
    >
      <motion.img
        src="/premium_genz_singer_3d_1777823703098.png"
        alt="Premium Singer"
        style={{
          width: '100%',
          height: 'auto',
          filter: 'drop-shadow(20px 20px 40px rgba(0,0,0,0.15))'
        }}
        animate={{
          rotate: [0, -1, 1, 0],
          y: [0, -15, 0]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
};

export default AnimatedSinger;
