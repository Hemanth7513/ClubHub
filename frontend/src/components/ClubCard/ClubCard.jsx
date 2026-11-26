import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, BadgeCheck, ArrowUpRight, Calendar } from 'lucide-react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
} from 'framer-motion';
import Button from '../Button/Button';
import useMagnetic from '../../hooks/useMagnetic';
import './ClubCard.css';

const CATEGORY_ACCENTS = {
  'Social & Recreation Clubs': 'var(--accent-cyan)',
  'Service Clubs': 'var(--accent-yellow)',
  'NGOs & Social Organizations': 'var(--accent-lime)',
  'Sports & Activity Clubs': 'var(--accent-pink)',
  'Cultural & Literary Clubs': 'var(--accent-violet)',
  'Professional & Networking': 'var(--accent-orange)',
  'Student & Tech Groups': 'var(--accent-cyan)',
  'Nightlife & Entertainment': 'var(--accent-pink)',
};

const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

const ClubCard = React.memo(({ club, index = 0 }) => {
  const cardRef = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { handleMouseMove: magMove, handleMouseLeave: magLeave, style: magStyle } = useMagnetic(0.25, 70);

  // Framer 3D pointer-tracking tilt & spotlight
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const spotX = useMotionValue(50);
  const spotY = useMotionValue(50);

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [3.5, -3.5]), { stiffness: 260, damping: 24 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-3.5, 3.5]), { stiffness: 260, damping: 24 });
  const spotlight = useMotionTemplate`radial-gradient(280px circle at ${spotX}% ${spotY}%, rgba(255, 255, 255, 0.28), transparent 70%)`;

  const handleCardMouseMove = (e) => {
    if (shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width;
    const yPct = (e.clientY - rect.top) / rect.height;
    mouseX.set(xPct);
    mouseY.set(yPct);
    spotX.set(xPct * 100);
    spotY.set(yPct * 100);
  };

  const handleCardMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
    spotX.set(50);
    spotY.set(50);
  };

  const isVerified = Boolean(club.isVerified ?? club.is_verified);
  const imageSrc = club.imageUrl || club.image_url;
  const estYear = club.establishedYear || club.established_year;
  const categoryColor = CATEGORY_ACCENTS[club.category] || 'var(--accent-yellow)';
  const plainDesc = stripHtml(club.description);

  return (
    <motion.article
      ref={cardRef}
      layout="position"
      className="club-card"
      onMouseMove={handleCardMouseMove}
      onMouseLeave={handleCardMouseLeave}
      style={shouldReduceMotion ? undefined : { rotateX, rotateY, transformPerspective: 900 }}
      initial={{ opacity: 0, y: 36, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.18 } }}
      transition={{
        duration: 0.45,
        delay: Math.min((index % 6) * 0.06, 0.3),
        type: 'spring',
        stiffness: 140,
        damping: 18,
      }}
      whileHover={shouldReduceMotion ? undefined : { y: -6 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
    >
      {!shouldReduceMotion && (
        <motion.div className="club-card-spotlight" style={{ background: spotlight }} aria-hidden="true" />
      )}

      <Link to={`/club/${club.id}`} className="club-card-image-link" aria-label={`View ${club.name}`}>
        <div
          className="club-card-image"
          style={{ background: `linear-gradient(135deg, ${categoryColor} 0%, var(--accent-pink) 100%)` }}
        >
          <span className="club-card-monogram" aria-hidden="true">
            {club.name?.charAt(0)?.toUpperCase() || 'C'}
          </span>

          {imageSrc && !imgError && (
            <img
              src={imageSrc}
              alt={club.name}
              loading="lazy"
              className={`club-card-img ${imgLoaded ? 'is-loaded' : ''}`}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          )}

          <div className="club-card-scrim" aria-hidden="true" />

          {club.category && (
            <span className="club-category-badge" style={{ backgroundColor: categoryColor }}>
              {club.category}
            </span>
          )}

          {isVerified && (
            <span className="club-verified-pill" title="Verified Club">
              <BadgeCheck size={14} />
              <span>Verified</span>
            </span>
          )}
        </div>
      </Link>

      <div className="club-card-content">
        <Link to={`/club/${club.id}`} className="club-card-title-link">
          <h3>{club.name}</h3>
        </Link>

        <p className="club-description">
          {plainDesc.length > 115 ? `${plainDesc.substring(0, 115)}...` : plainDesc}
        </p>

        <div className="club-meta">
          {club.location && (
            <div className="meta-item">
              <MapPin size={15} className="meta-icon" />
              <span className="meta-text">{club.location}</span>
            </div>
          )}
          {estYear && (
            <div className="meta-item meta-year">
              <Calendar size={14} className="meta-icon" />
              <span>Est. {estYear}</span>
            </div>
          )}
        </div>

        <div className="club-card-footer">
          <Link to={`/club/${club.id}`} className="club-card-cta-link">
            <motion.div style={magStyle} onMouseMove={magMove} onMouseLeave={magLeave}>
              <Button variant="primary" className="w-full club-explore-btn">
                <span>Explore</span>
                <ArrowUpRight size={16} />
              </Button>
            </motion.div>
          </Link>

          {club.googleMapsUrl && club.googleMapsUrl.startsWith('https://') && (
            <a
              href={club.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="directions-btn"
              title="Open in Google Maps"
              aria-label={`Directions to ${club.name}`}
            >
              <Button variant="secondary" className="w-full">
                <Navigation size={17} />
              </Button>
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
});

export default ClubCard;
