import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Mail, Calendar, Navigation, Share2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/Button/Button';
import API_BASE_URL from '../config';
import './ClubDetailPage.css';

const ClubDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClubDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/clubs/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Club not found');
          }
          throw new Error('Failed to fetch club details');
        }
        const data = await response.json();
        setClub(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching club details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClubDetails();
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: club.name,
        text: `Check out ${club.name} on Vijayawada ClubHub!`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div className="spinner"></div>
        <h2>Loading details...</h2>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div className="error-message">{error || 'Something went wrong.'}</div>
        <Link to="/">
          <Button variant="primary">Return to Directory</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container club-detail-page">
      <div className="detail-nav-row">
        <Link to="/" className="back-link">
          <ArrowLeft size={20} />
          Back to Directory
        </Link>
        <button onClick={handleShare} className="share-btn-round" title="Share this club">
          <Share2 size={20} />
        </button>
      </div>

      <motion.div 
        className="club-detail-hero"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <img 
          src={club.imageUrl || 'https://via.placeholder.com/1200x400'} 
          alt={club.name} 
          className="hero-image"
        />
        <div className="hero-overlay">
          <div className="hero-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1>{club.name}</h1>
            {club.is_verified && <CheckCircle size={32} color="white" fill="#1da1f2" title="Verified Club" />}
          </div>
          <span className="hero-badge">{club.category}</span>
        </div>
      </motion.div>

      <div className="club-detail-content">
        <motion.div 
          className="content-main"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2>About Us</h2>
          <p>{club.description}</p>
        </motion.div>

        <motion.div 
          className="content-sidebar"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="info-card">
            <h3>Key Info</h3>
            
            {club.location && (
              <div className="info-item">
                <MapPin className="info-icon" size={32} />
                <div className="info-text">
                  <span className="info-label">Address</span>
                  <span className="info-value">{club.location}</span>
                </div>
              </div>
            )}
            
            {club.contactInfo && (
              <div className="info-item">
                <Mail className="info-icon" size={32} />
                <div className="info-text">
                  <span className="info-label">Contact</span>
                  <span className="info-value">{club.contactInfo}</span>
                </div>
              </div>
            )}
            
            {club.establishedYear && (
              <div className="info-item">
                <Calendar className="info-icon" size={32} />
                <div className="info-text">
                  <span className="info-label">Established</span>
                  <span className="info-value">{club.establishedYear}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="sidebar-actions">
            <Button variant="primary" className="w-full btn-large mb-4">
              Request to Join
            </Button>
            
            {club.googleMapsUrl && (
              <a 
                href={club.googleMapsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button variant="secondary" className="w-full btn-large">
                  <Navigation size={20} />
                  Get Directions
                </Button>
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ClubDetailPage;
