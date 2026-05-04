import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Navigation } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Button from '../Button/Button';
import useMagnetic from '../../hooks/useMagnetic';
import './ClubCard.css';

const COLORS = [
  'var(--accent-pink)',
  'var(--accent-yellow)',
  'var(--accent-green)',
  'var(--accent-blue)',
  'var(--accent-purple)',
  'var(--accent-peach)',
  'var(--accent-mint)',
  'var(--accent-coral)',
];

const ClubCard = ({ club, index }) => {
  const cardColor = COLORS[index % COLORS.length];
  const ref = useRef(null);
  const { position: magPos, handleMouseMove: magMove, handleMouseLeave: magLeave, style: magStyle } = useMagnetic(0.3, 80);

  // Mouse-tracking for 3D tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 20 });
  const springY = useSpring(y, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(relX);
    y.set(relY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className="club-card glass-panel"
      initial={{ opacity: 0, y: 60, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration: 0.55,
        delay: (index % 3) * 0.12,
        type: 'spring',
        stiffness: 90,
        damping: 15,
      }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -10 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className="club-card-image"
        style={{ 
          backgroundImage: `url(${club.imageUrl || 'https://via.placeholder.com/400x200'})`,
          transform: 'translateZ(30px)' 
        }}
      >
        <span className="club-category-badge">{club.category}</span>
      </div>

      <div className="club-card-content" style={{ backgroundColor: cardColor, transform: 'translateZ(50px)' }}>
        <motion.h3 style={{ transform: 'translateZ(20px)' }}>{club.name}</motion.h3>
        <p className="club-description">
          {club.description.length > 120
            ? `${club.description.substring(0, 120)}...`
            : club.description}
        </p>

        <div className="club-meta">
          {club.location && (
            <div className="meta-item">
              <MapPin size={16} />
              <span>{club.location}</span>
            </div>
          )}
        </div>

        <div className="club-card-footer">
          <Link to={`/club/${club.id}`} className="flex-1">
            <motion.div 
              style={magStyle} 
              onMouseMove={magMove} 
              onMouseLeave={magLeave}
            >
              <Button variant="primary" className="w-full">View Details</Button>
            </motion.div>
          </Link>
          {club.googleMapsUrl && (
            <a 
              href={club.googleMapsUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="directions-btn"
            >
              <Button variant="secondary" className="w-full">
                <Navigation size={18} />
              </Button>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ClubCard;
