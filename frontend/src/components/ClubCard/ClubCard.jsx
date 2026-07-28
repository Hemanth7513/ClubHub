import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../Button/Button';
import useMagnetic from '../../hooks/useMagnetic';
import './ClubCard.css';

const COLORS = [
  'var(--bg-primary)',
  'var(--accent-yellow)'
];

const ClubCard = React.memo(({ club, index }) => {
  const cardColor = COLORS[index % COLORS.length];
  const ref = useRef(null);
  const { position: magPos, handleMouseMove: magMove, handleMouseLeave: magLeave, style: magStyle } = useMagnetic(0.3, 80);

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
      whileHover={{ y: -10, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="club-card-image" style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-pink) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#ffffff', fontSize: '4rem', fontWeight: '900', opacity: 0.4 }}>{club.name.charAt(0).toUpperCase()}</span>
        
        {(club.imageUrl || club.image_url) && (
          <img 
            src={club.imageUrl || club.image_url} 
            alt={club.name}
            loading="lazy"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}
      </div>

      <div className="club-card-content" style={{ backgroundColor: cardColor }}>
        <motion.h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {club.name}
          {club.is_verified && <CheckCircle size={18} color="white" fill="#1da1f2" title="Verified Club" />}
        </motion.h3>
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
          {club.googleMapsUrl && club.googleMapsUrl.startsWith('https://') && (
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
});

export default ClubCard;
