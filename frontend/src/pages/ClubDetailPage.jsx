import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Calendar, MapPin, Map, Share2, Ticket, CheckCircle, Mail, Navigation } from 'lucide-react';
import DOMPurify from 'dompurify';
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
  const [copied, setCopied] = useState(false);

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
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
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
        <button onClick={handleShare} className="share-btn-round" title={copied ? 'Link copied!' : 'Share this club'} aria-label="Share club">
          {copied ? <CheckCircle size={20} color="var(--accent-lime)" /> : <Share2 size={20} />}
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
          <div 
            className="rich-text-content" 
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(club.description) }} 
            style={{ lineHeight: '1.6', fontSize: '1.1rem' }}
          />
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
                style={{ display: 'block', marginBottom: '1rem' }}
              >
                <Button variant="secondary" className="w-full btn-large">
                  <Navigation size={20} />
                  Get Directions
                </Button>
              </a>
            )}
            
            <a 
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out ${club.name} on Vijayawada ClubHub!\n${club.description.substring(0, 50)}...\n\nExplore here: ${window.location.href}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
              style={{ display: 'block' }}
            >
              <Button style={{ backgroundColor: '#25D366', color: 'white', borderColor: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="w-full btn-large">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '8px' }}>
                  <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                </svg>
                Share on WhatsApp
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ClubDetailPage;
