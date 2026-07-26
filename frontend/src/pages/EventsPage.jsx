import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, ArrowRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/Button/Button';
import SkeletonCard from '../components/Loaders/SkeletonCard';
import TicketModal from '../components/Ticketing/TicketModal';
import './EventsPage.css';

import API_BASE_URL from '../config';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const categories = ['All', 'Gala', 'Workshop', 'Sports', 'Nightlife', 'Meetup', 'Conference', 'Exhibition', 'Fundraiser'];

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/events`);
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = filter === 'All' 
    ? events 
    : events.filter(e => e.category === filter);

  if (loading) return (
    <div className="container events-page">
      <div className="page-header-flex">
        <div>
          <h1 className="text-gradient">Upcoming Events</h1>
          <p>Loading the latest events...</p>
        </div>
      </div>
      <div className="events-grid">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <SkeletonCard key={`skeleton-${i}`} />
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div className="container events-page flex-center" style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
      <div className="glass-panel" style={{ padding: '3rem' }}>
        <h2 style={{ color: 'var(--accent-pink)' }}>Unable to load events</h2>
        <p style={{ marginTop: '1rem' }}>Please ensure the database is properly configured.</p>
        <Button variant="primary" style={{ marginTop: '2rem' }} onClick={fetchEvents}>Try Again</Button>
      </div>
    </div>
  );

  return (
    <div className="container events-page">
      <motion.div 
        className="page-header-flex"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-gradient">Upcoming Events</h1>
          <p>Discover what's happening in Vijayawada's elite circles.</p>
        </div>
        <Link to="/add-event">
          <Button variant="primary">
            <Plus size={20} /> Post Event
          </Button>
        </Link>
      </motion.div>

      {filteredEvents.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', marginTop: '2rem' }}>
          {events.length === 0 ? (
            <>
              <h3>No events found</h3>
              <p>Be the first to post an event for your community!</p>
              <Link to="/add-event" style={{ marginTop: '2rem', display: 'inline-block' }}>
                <Button variant="outline">Post First Event</Button>
              </Link>
            </>
          ) : (
            <>
              <h3>No events in this category</h3>
              <p>Try selecting a different filter above.</p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="events-filter">
            {categories.map(cat => (
              <button 
                key={cat} 
                className={`filter-btn ${filter === cat ? 'active' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="events-grid">
            {filteredEvents.map((event, index) => (
              <motion.div 
                key={event.id}
                className="event-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="event-image">
                  <img src={event.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000'} alt={event.title} />
                  <div className="event-badge">{event.category}</div>
                </div>
                <div className="event-details">
                  <span className="event-club">{event.clubs?.name}</span>
                  <h3>{event.title}</h3>
                  <div className="event-info">
                    <div className="info-item">
                      <Calendar size={16} /> <span>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="info-item">
                      <Clock size={16} /> <span>{new Date(event.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="info-item">
                      <MapPin size={16} /> <span>{event.location}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                    <Button 
                      variant="outline" 
                      style={{ flex: 1 }}
                      onClick={() => {
                        setSelectedEvent(event);
                        setIsModalOpen(true);
                      }}
                    >
                      Buy Ticket <ArrowRight size={18} />
                    </Button>
                    <a 
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out ${event.title} at ${event.clubs?.name}! \nDate: ${new Date(event.date).toLocaleDateString()} \nLocation: ${event.location}\n\nBook your tickets on Vijayawada ClubHub: ${window.location.href}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="whatsapp-btn"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#25D366', color: 'white', borderRadius: '8px', padding: '0 1rem', textDecoration: 'none', transition: 'transform 0.2s' }}
                      title="Share on WhatsApp"
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

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

export default EventsPage;
