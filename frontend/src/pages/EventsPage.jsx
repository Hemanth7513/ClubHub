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
  
  const categories = ['All', 'Gala', 'Workshop', 'Sports', 'Nightlife'];

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

      {events.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', marginTop: '2rem' }}>
          <h3>No events found</h3>
          <p>Be the first to post an event for your community!</p>
          <Link to="/add-event" style={{ marginTop: '2rem', display: 'inline-block' }}>
            <Button variant="outline">Post First Event</Button>
          </Link>
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
                  <Button 
                    variant="outline" 
                    className="btn-full"
                    onClick={() => {
                      setSelectedEvent(event);
                      setIsModalOpen(true);
                    }}
                  >
                    Buy Ticket <ArrowRight size={18} />
                  </Button>
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
