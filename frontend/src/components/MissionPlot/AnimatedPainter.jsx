import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

const AnimatedPainter = () => {
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

  const x = useTransform(mouseX, [-0.5, 0.5], [-20, 20]);
  const y = useTransform(mouseY, [-0.5, 0.5], [-20, 20]);

  return (
    <motion.div
      className="painter-container"
      style={{
        position: 'absolute',
        right: '-50px',
        bottom: '-50px',
        zIndex: -1,
        width: '450px',
        pointerEvents: 'none',
        x,
        y
      }}
    >
      <motion.img
        src="/premium_genz_painter_3d_1777823721653.png"
        alt="Premium Painter"
        style={{
          width: '100%',
          height: 'auto',
          filter: 'drop-shadow(20px 20px 40px rgba(0,0,0,0.15))'
        }}
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, 1, -1, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
};

export default AnimatedPainter;
