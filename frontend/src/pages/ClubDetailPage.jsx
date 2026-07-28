import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Share2, CheckCircle, MapPin, Mail, Calendar,
  Navigation, Pencil, CalendarDays, Clock, ExternalLink, Ticket
} from 'lucide-react';
import DOMPurify from 'dompurify';
import { motion } from 'framer-motion';
import Button from '../components/Button/Button';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import API_BASE_URL from '../config';
import TicketModal from '../components/Ticketing/TicketModal';
import './ClubDetailPage.css';

const ClubDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [clubRes, eventsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/clubs/${id}`),
          fetch(`${API_BASE_URL}/events`)
        ]);

        if (!clubRes.ok) throw new Error(clubRes.status === 404 ? 'Club not found' : 'Failed to load club');
        const clubData = await clubRes.json();
        setClub(clubData);

        if (eventsRes.ok) {
          const allEvents = await eventsRes.json();
          // Filter upcoming events that belong to this club
          const now = new Date();
          const clubEvents = allEvents.filter(
            e => String(e.club_id) === String(id) && new Date(e.date) >= now
          );
          setEvents(clubEvents);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: club.name, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const isOwner = user && club && club.userId && club.userId === user.id;
  const { token } = useAuth();

  const handleOpenTicketModal = (event) => {
    if (!user) {
      alert("Please log in to RSVP.");
      navigate('/login');
      return;
    }
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div className="spinner" />
        <h2>Loading details...</h2>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div className="error-message">{error || 'Something went wrong.'}</div>
        <Link to="/"><Button variant="primary">Return to Directory</Button></Link>
      </div>
    );
  }

  const currentUrl = window.location.href;
  const ogImageUrl = club.imageUrl || 'https://clubhub-vja.vercel.app/favicon.png';

  return (
    <div className="container club-detail-page">
      <Helmet>
        <title>{club.name} | ClubHub</title>
        <meta name="description" content={club.description ? club.description.substring(0, 160) : `Join ${club.name} on ClubHub.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:title" content={`${club.name} | ClubHub`} />
        <meta property="og:description" content={club.description ? club.description.substring(0, 160) : `Join ${club.name} on ClubHub.`} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={currentUrl} />
        <meta property="twitter:title" content={`${club.name} | ClubHub`} />
        <meta property="twitter:description" content={club.description ? club.description.substring(0, 160) : `Join ${club.name} on ClubHub.`} />
        <meta property="twitter:image" content={ogImageUrl} />
      </Helmet>

      {/* ── Nav Row ─────────────────────────────── */}
      <div className="detail-nav-row">
        <Link to="/" className="back-link">
          <ArrowLeft size={20} /> Back to Directory
        </Link>
        <div className="detail-nav-actions">
          {isOwner && (
            <Button variant="outline" size="small" onClick={() => navigate(`/edit-club/${club.id}`)}>
              <Pencil size={15} /> Edit Club
            </Button>
          )}
          <button onClick={handleShare} className="share-btn-round"
            title={copied ? 'Link copied!' : 'Share this club'} aria-label="Share club">
            {copied ? <CheckCircle size={20} color="var(--accent-green)" /> : <Share2 size={20} />}
          </button>
        </div>
      </div>

      {/* ── Hero ────────────────────────────────── */}
      <motion.div
        className="club-detail-hero"
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <img
          src={club.imageUrl || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80'}
          alt={club.name} className="hero-image"
          onError={e => e.target.src = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80'}
        />
        <div className="hero-overlay">
          <div className="hero-title">
            <h1>{club.name}</h1>
            {club.isVerified && (
              <span className="verified-pill">
                <CheckCircle size={15} /> Verified
              </span>
            )}
          </div>
          <span className="hero-badge">{club.category}</span>
        </div>
      </motion.div>

      {/* ── Main + Sidebar grid ─────────────────── */}
      <div className="club-detail-content">

        {/* Left: About + Upcoming Events */}
        <motion.div
          className="content-main"
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2>About Us</h2>
          <div
            className="rich-text-content"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(club.description) }}
            style={{ lineHeight: '1.7', fontSize: '1.05rem' }}
          />

          {/* Upcoming Events for this club */}
          <div className="club-events-section">
            <h2>
              <CalendarDays size={22} style={{ display: 'inline', marginRight: 8 }} />
              Upcoming Events
            </h2>
            {events.length === 0 ? (
              <div className="club-no-events">
                <Clock size={32} style={{ opacity: 0.3 }} />
                <p>No upcoming events scheduled yet.</p>
              </div>
            ) : (
              <div className="club-events-list">
                {events.map(event => (
                  <div key={event.id} className="club-event-row glass-panel">
                    {event.image_url && (
                      <img src={event.image_url} alt={event.title} className="club-event-thumb"
                        onError={e => e.target.style.display = 'none'} />
                    )}
                    <div className="club-event-info">
                      <h4>{event.title}</h4>
                      <span className="club-event-date">
                        <Calendar size={13} />
                        {new Date(event.date).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </span>
                      {event.location && (
                        <span className="club-event-loc"><MapPin size={13} /> {event.location}</span>
                      )}
                    </div>
                    <Button variant="primary" size="small" onClick={() => handleOpenTicketModal(event)}>
                      <Ticket size={13} style={{ marginRight: '5px' }} /> RSVP
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Right: Info Card + Actions + Maps */}
        <motion.div
          className="content-sidebar"
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="info-card">
            <h3>Key Info</h3>

            {club.location && (
              <div className="info-item">
                <MapPin className="info-icon" size={28} />
                <div className="info-text">
                  <span className="info-label">Address</span>
                  <span className="info-value">{club.location}</span>
                </div>
              </div>
            )}

            {club.contactInfo && (
              <div className="info-item">
                <Mail className="info-icon" size={28} />
                <div className="info-text">
                  <span className="info-label">Contact</span>
                  <span className="info-value">{club.contactInfo}</span>
                </div>
              </div>
            )}

            {club.establishedYear && (
              <div className="info-item">
                <Calendar className="info-icon" size={28} />
                <div className="info-text">
                  <span className="info-label">Established</span>
                  <span className="info-value">{club.establishedYear}</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="sidebar-actions">
            {/* Contact Club */}
            {club.contactInfo && (
              <a
                href={
                  club.contactInfo.includes('@')
                    ? `mailto:${club.contactInfo}`
                    : club.contactInfo.match(/^\d/)
                    ? `tel:${club.contactInfo}`
                    : club.contactInfo.startsWith('http://') || club.contactInfo.startsWith('https://')
                    ? club.contactInfo
                    : `https://${club.contactInfo}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="sidebar-action-link"
              >
                <Button variant="primary" className="btn-large">
                  <Mail size={18} /> Contact Club
                </Button>
              </a>
            )}

            {/* Get Directions */}
            {club.googleMapsUrl && club.googleMapsUrl.startsWith('https://') && (
              <a href={club.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="sidebar-action-link">
                <Button variant="outline" className="btn-large">
                  <Navigation size={18} /> Get Directions
                </Button>
              </a>
            )}

            {/* WhatsApp Share */}
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `Check out ${club.name} on Vijayawada ClubHub!\n\n${window.location.href}`
              )}`}
              target="_blank" rel="noopener noreferrer" className="sidebar-action-link"
            >
              <Button className="btn-large btn-whatsapp">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                </svg>
                Share on WhatsApp
              </Button>
            </a>
          </div>

          {/* Google Maps Embed */}
          {club.googleMapsUrl && club.googleMapsUrl.startsWith('https://') && (
            <div className="maps-embed-card">
              <h4><MapPin size={16} /> Location</h4>
              <a href={club.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="maps-embed-link">
                <div className="maps-placeholder">
                  <Navigation size={28} />
                  <span>Open in Google Maps</span>
                  <ExternalLink size={14} />
                </div>
              </a>
            </div>
          )}
        </motion.div>
      </div>

      {selectedEvent && (
        <TicketModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          event={selectedEvent} 
        />
      )}
    </div>
  );
};

export default ClubDetailPage;
