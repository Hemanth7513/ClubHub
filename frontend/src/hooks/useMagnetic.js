import { useState, useEffect, useCallback } from 'react';

/**
 * useMagnetic Hook
 * Creates a magnetic pull effect on elements towards the mouse cursor.
 * 
 * @param {number} intensity - How strongly the element pulls (default: 0.5)
 * @param {number} range - Distance in px where the pull starts (default: 100)
 */
export const useMagnetic = (intensity = 0.5, range = 100) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e) => {
    const { clientX, clientY, target } = e;
    // We expect the ref to be attached to the target or parent
    // But for a hook to work generally, we can calculate based on the bounding rect of the target
    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    if (distance < range) {
      setPosition({
        x: distanceX * intensity,
        y: distanceY * intensity,
      });
    } else {
      setPosition({ x: 0, y: 0 });
    }
  }, [intensity, range]);

  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  return {
    position,
    handleMouseMove,
    handleMouseLeave,
    style: {
      transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
      transition: position.x === 0 ? 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)' : 'none',
    }
  };
};

export default useMagnetic;
