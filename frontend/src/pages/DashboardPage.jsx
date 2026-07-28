import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Ticket, Search, Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../config';
import Button from '../components/Button/Button';
import SkeletonCard from '../components/Loaders/SkeletonCard';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user, token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/tickets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setTickets(await res.json());
    } catch (err) {
      console.error('Fetch tickets error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  return (
    <div className="user-dashboard-page">
      <div className="dashboard-header-banner">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1>Welcome back, <span className="highlight-pink">{user?.name}</span></h1>
            <p className="subtitle">Your personal ClubHub portal.</p>
          </motion.div>
        </div>
      </div>

      <div className="container user-dashboard-content">
        {/* Quick Actions */}
        <section className="quick-actions-section">
          <h2>Quick Links</h2>
          <div className="quick-actions-grid">
            <Link to="/" className="quick-action-card glass-panel">
              <div className="qa-icon" style={{ background: 'var(--accent-lime)' }}>
                <Search size={28} color="#1a1a1a" />
              </div>
              <h3>Explore Clubs</h3>
              <p>Find new communities to join in your city.</p>
            </Link>
            <Link to="/events" className="quick-action-card glass-panel">
              <div className="qa-icon" style={{ background: 'var(--accent-pink)' }}>
                <Calendar size={28} color="#1a1a1a" />
              </div>
              <h3>Upcoming Events</h3>
              <p>See what's happening around you this week.</p>
            </Link>
          </div>
        </section>

        {/* My Tickets */}
        <section className="tickets-section">
          <h2><Ticket size={24} style={{ display: 'inline', marginRight: 10 }} /> My RSVPs</h2>
          
          {loading ? (
            <div className="tickets-grid">
              <SkeletonCard index={0} />
              <SkeletonCard index={1} />
              <SkeletonCard index={2} />
            </div>
          ) : tickets.length === 0 ? (
            <div className="empty-tickets glass-panel">
              <Ticket size={48} opacity={0.3} />
              <h3>No tickets yet</h3>
              <p>You haven't RSVP'd to any events. Why not explore what's happening?</p>
              <Link to="/events">
                <Button>Browse Events</Button>
              </Link>
            </div>
          ) : (
            <div className="tickets-grid">
              {tickets.map(ticket => (
                <motion.div key={ticket.id} className="ticket-card glass-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {ticket.events.image_url && (
                    <div className="ticket-image" style={{ backgroundImage: `url(${ticket.events.image_url})` }} />
                  )}
                  <div className="ticket-content">
                    <div className="ticket-header">
                      <span className="ticket-club">{ticket.events.clubs.name}</span>
                      <span className="ticket-id">#{ticket.id}</span>
                    </div>
                    <h3>{ticket.events.title}</h3>
                    <div className="ticket-details">
                      <span><Calendar size={14} /> {new Date(ticket.events.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      {ticket.events.location && <span><MapPin size={14} /> {ticket.events.location}</span>}
                    </div>
                    <div className="ticket-footer">
                      <span className="ticket-attendee">Admit 1: {ticket.attendee_name}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
