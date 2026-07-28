import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';
import { ArrowLeft, Share2, MapPin, Calendar, Clock, CheckCircle, Ticket } from 'lucide-react';

import API_BASE_URL from '../config';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button/Button';
import TicketModal from '../components/Ticketing/TicketModal';
import EventComments from '../components/Comments/EventComments';
import './EventDetailPage.css';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/events`);
        if (!res.ok) throw new Error('Failed to fetch events');
        const allEvents = await res.json();
        
        // Find the event by ID since the backend currently returns all events
        // (A dedicated /events/:id route would be better, but this works for now)
        const foundEvent = allEvents.find(e => String(e.id) === String(id));
        if (!foundEvent) {
          throw new Error('Event not found');
        }
        setEvent(foundEvent);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: event.title, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleOpenTicketModal = () => {
    if (!user) {
      alert("Please log in to RSVP.");
      navigate('/login');
      return;
    }
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '6rem' }}>
        <div className="spinner" />
        <h2>Loading event details...</h2>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '6rem' }}>
        <div className="error-message">{error || 'Something went wrong.'}</div>
        <Link to="/events"><Button variant="primary">Return to Events</Button></Link>
      </div>
    );
  }

  const currentUrl = window.location.href;
  const ogImageUrl = event.image_url || 'https://clubhub-vja.vercel.app/favicon.png';

  // Check if current user is the owner of the club hosting the event
  // For simplicity, we only show edit if user is admin (or we'd need to fetch club owners)
  const isAdmin = user?.role === 'admin';

  return (
    <div className="container event-detail-page">
      <Helmet>
        <title>{event.title} | ClubHub</title>
        <meta name="description" content={event.title} />
        <meta property="og:title" content={`${event.title} | ClubHub`} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* Nav Row */}
      <div className="detail-nav-row" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/events" className="back-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--text-main)', fontWeight: '600' }}>
          <ArrowLeft size={20} /> Back to Events
        </Link>
        <div className="detail-nav-actions" style={{ display: 'flex', gap: '1rem' }}>
          {isAdmin && (
            <Button variant="outline" size="small" onClick={() => navigate(`/edit-event/${event.id}`)}>
              Edit Event
            </Button>
          )}
          <button onClick={handleShare} className="share-btn-round"
            title={copied ? 'Link copied!' : 'Share this event'} 
            style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--border-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', cursor: 'pointer' }}>
            {copied ? <CheckCircle size={18} color="var(--accent-green)" /> : <Share2 size={18} />}
          </button>
        </div>
      </div>

      {/* Hero */}
      <motion.div
        className="event-detail-hero"
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <img
          src={event.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1200'}
          alt={event.title} className="event-hero-image"
          onError={e => e.target.style.display = 'none'}
        />
        <div className="event-hero-overlay">
          <div className="event-hero-title">
            <h1>{event.title}</h1>
            <Link to={`/club/${event.clubs?.id}`} className="event-hero-club">
              By {event.clubs?.name}
            </Link>
          </div>
          <span className="event-hero-badge">{event.category}</span>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="event-detail-content">
        {/* Left: About + Comments */}
        <motion.div
          className="event-content-main"
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div style={{ background: 'var(--bg-surface)', padding: '2rem', borderRadius: '12px', border: '3px solid var(--border-dark)', boxShadow: '4px 4px 0px var(--border-dark)' }}>
            <h2 style={{ marginTop: 0, borderBottom: '2px solid var(--border-dark)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>About Event</h2>
            {event.description ? (
              <div
                className="rich-text-content"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(event.description) }}
                style={{ lineHeight: '1.7', fontSize: '1.05rem' }}
              />
            ) : (
              <p>No description provided.</p>
            )}
          </div>

          <EventComments eventId={event.id} />
        </motion.div>

        {/* Right: Info Sidebar */}
        <motion.div
          className="event-content-sidebar"
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="event-info-card">
            <h3>When & Where</h3>

            <div className="event-info-item">
              <Calendar className="event-info-icon" size={24} />
              <div className="event-info-text">
                <span className="event-info-label">Date</span>
                <span className="event-info-value">
                  {new Date(event.date).toLocaleDateString('en-IN', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            <div className="event-info-item">
              <Clock className="event-info-icon" size={24} />
              <div className="event-info-text">
                <span className="event-info-label">Time</span>
                <span className="event-info-value">
                  {new Date(event.date).toLocaleTimeString('en-IN', {
                    hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            <div className="event-info-item">
              <MapPin className="event-info-icon" size={24} />
              <div className="event-info-text">
                <span className="event-info-label">Location</span>
                <span className="event-info-value">{event.location}</span>
              </div>
            </div>
          </div>

          <div className="event-action-buttons">
            <Button variant="primary" size="large" onClick={handleOpenTicketModal} style={{ width: '100%' }}>
              <Ticket size={20} style={{ marginRight: '8px' }} /> RSVP / Get Tickets
            </Button>
          </div>
        </motion.div>
      </div>

      <TicketModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        event={event} 
      />
    </div>
  );
};

export default EventDetailPage;
