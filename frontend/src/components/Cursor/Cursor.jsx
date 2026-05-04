import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import './Cursor.css';

const Cursor = () => {
  const [hoverState, setHoverState] = useState(''); // '', 'hovering', 'clicking'
  
  const mouse = {
    x: useMotionValue(-100),
    y: useMotionValue(-100),
  };

  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
  const springX = useSpring(mouse.x, springConfig);
  const springY = useSpring(mouse.y, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.x.set(e.clientX);
      mouse.y.set(e.clientY);

      const target = e.target;
      if (target.closest('button, a, .pulse-card, .wheel-card, input, select')) {
        setHoverState('hovering');
      } else {
        setHoverState('');
      }
    };

    const handleMouseDown = () => setHoverState('clicking');
    const handleMouseUp = () => setHoverState('hovering');

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className={`cursor-wrapper ${hoverState}`}>
      <motion.div
        className="cursor-dot"
        style={{
          x: mouse.x,
          y: mouse.y,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />
      <motion.div
        className="cursor-ring"
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />
    </div>
  );
};

export default Cursor;
