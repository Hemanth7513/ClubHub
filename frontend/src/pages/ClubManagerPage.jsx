import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Calendar as CalendarIcon, Activity, Settings,
  PlusCircle, LayoutDashboard, Pencil, Trash2, CheckCircle,
  AlertCircle, TicketIcon, Clock, Scan, MapPin
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import Button from '../components/Button/Button';
import TicketScanner from '../components/Scanner/TicketScanner';
import './ClubManagerPage.css';

/* ─── Small utility: is the event in the past? ─────── */
const isEventPast = (dateStr) => new Date(dateStr) < new Date();

/* ─── Confirm delete modal ──────────────────────────── */
const ConfirmModal = ({ message, onConfirm, onCancel, loading, error }) => (
  <div className="confirm-overlay">
    <motion.div
      className="confirm-modal glass-panel"
      initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.85, opacity: 0 }}
    >
      <AlertCircle size={36} style={{ color: 'var(--accent-pink)' }} />
      <p>{message}</p>
      {error && <p style={{ color: 'var(--accent-pink)', fontSize: '0.9rem', fontWeight: 600 }}>{error}</p>}
      <div className="confirm-actions">
        <Button variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button variant="primary" onClick={onConfirm} disabled={loading}
          style={{ background: 'var(--accent-pink)', border: '3px solid var(--border-dark)' }}>
          {loading ? 'Deleting...' : 'Yes, Delete'}
        </Button>
      </div>
    </motion.div>
  </div>
);

const ClubManagerPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'club'|'event', id, name }
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [selectedScannerEvent, setSelectedScannerEvent] = useState(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [clubsRes, eventsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/users/clubs`, { headers }),
        fetch(`${API_BASE_URL}/users/events`, { headers })
      ]);
      if (clubsRes.ok) setClubs(await clubsRes.json());
      if (eventsRes.ok) setEvents(await eventsRes.json());
    } catch (err) {
      console.error('Dashboard fetch error', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ─── Delete handlers ─────────────────────────────── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError(null);
    const endpoint = deleteTarget.type === 'club'
      ? `${API_BASE_URL}/clubs/${deleteTarget.id}`
      : `${API_BASE_URL}/events/${deleteTarget.id}`;
    try {
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Delete failed. Please try again.');
      }
      if (deleteTarget.type === 'club') {
        setClubs(prev => prev.filter(c => c.id !== deleteTarget.id));
      } else {
        setEvents(prev => prev.filter(e => e.id !== deleteTarget.id));
      }
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const upcomingEvents = events.filter(e => !isEventPast(e.date));
  const pastEvents = events.filter(e => isEventPast(e.date));

  return (
    <div className="dashboard-page">
      {/* Confirm delete modal */}
      <AnimatePresence>
        {deleteTarget && (
          <ConfirmModal
            message={`Delete "${deleteTarget.name}"? This action cannot be undone.`}
            onConfirm={handleDelete}
            onCancel={() => { setDeleteTarget(null); setDeleteError(null); }}
            loading={deleteLoading}
            error={deleteError}
          />
        )}
      </AnimatePresence>

      <div className="container dashboard-container">

        {/* ── Sidebar ──────────────────────────────────── */}
        <aside className="dashboard-sidebar glass-panel">
          <div className="sidebar-header">
            <h3>{user?.role === 'admin' ? 'Owner Panel' : 'Member Panel'}</h3>
          </div>
          <nav className="sidebar-nav">
            <button className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}>
              <LayoutDashboard size={18} /> Overview
            </button>
            <button className={`sidebar-link ${activeTab === 'clubs' ? 'active' : ''}`}
              onClick={() => setActiveTab('clubs')}>
              <Users size={18} /> My Clubs
              {clubs.length > 0 && <span className="sidebar-badge">{clubs.length}</span>}
            </button>
            <button className={`sidebar-link ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => setActiveTab('events')}>
              <CalendarIcon size={18} /> Manage Events
              {upcomingEvents.length > 0 && <span className="sidebar-badge">{upcomingEvents.length}</span>}
            </button>
            <button className={`sidebar-link ${activeTab === 'scanner' ? 'active' : ''}`}
              onClick={() => setActiveTab('scanner')}>
              <Scan size={18} /> Ticket Scanner
            </button>
            <Link to="/settings" className="sidebar-link">
              <Settings size={18} /> Settings
            </Link>
          </nav>
        </aside>

        {/* ── Main Content ──────────────────────────────── */}
        <main className="dashboard-content">
          <motion.div className="dashboard-header" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="title-xl" style={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px 15px', lineHeight: '1.2' }}>
              Welcome,{' '}
              <span className="editorial-font" style={{
                background: 'var(--accent-yellow)', padding: '0 10px',
                border: '3px solid var(--border-dark)', boxShadow: '4px 4px 0px var(--border-dark)',
                display: 'inline-block', whiteSpace: 'nowrap'
              }}>
                {user?.name?.split(' ')[0] || (user?.role === 'admin' ? 'Owner' : 'Member')}
              </span>
            </h1>
            <p>Manage your registered communities and events from one central hub.</p>
          </motion.div>

          {loading ? (
            <div className="spinner" style={{ margin: '4rem auto' }} />
          ) : (
            <>
              {/* ── OVERVIEW TAB ──────────────────────── */}
              {activeTab === 'overview' && (
                <motion.div className="dashboard-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="stats-grid">
                    <div className="stat-card glass-panel" style={{ borderLeft: '6px solid var(--accent-cyan)' }}>
                      <div className="stat-icon"><LayoutDashboard size={24} color="var(--accent-cyan)" /></div>
                      <div className="stat-info">
                        <h4>Total Clubs</h4>
                        <h2>{clubs.length}</h2>
                      </div>
                    </div>
                    
                    <div className="stat-card glass-panel" style={{ borderLeft: '6px solid var(--accent-pink)' }}>
                      <div className="stat-icon"><CalendarIcon size={24} color="var(--accent-pink)" /></div>
                      <div className="stat-info">
                        <h4>Total Events</h4>
                        <h2>{events.length}</h2>
                      </div>
                    </div>
                    
                    <div className="stat-card glass-panel" style={{ borderLeft: '6px solid var(--accent-lime)' }}>
                      <div className="stat-icon"><Users size={24} color="var(--accent-lime)" /></div>
                      <div className="stat-info">
                        <h4>Total RSVPs</h4>
                        <h2>
                          {events.reduce((sum, event) => 
                            sum + (event.tickets ? event.tickets.reduce((tSum, t) => tSum + (t.sold || 0), 0) : 0), 0
                          )}
                        </h2>
                      </div>
                    </div>
                  </div>

                  <div className="quick-actions glass-panel">
                    <h3>Quick Actions</h3>
                    <div className="action-buttons">
                      <Link to="/add-club"><Button variant="primary"><PlusCircle size={18} /> New Club</Button></Link>
                      <Link to="/add-event"><Button variant="outline"><CalendarIcon size={18} /> Host Event</Button></Link>
                    </div>
                  </div>

                  {/* Recent clubs preview */}
                  {clubs.length > 0 && (
                    <div className="overview-recent glass-panel">
                      <div className="section-header">
                        <h3>Recent Clubs</h3>
                        <button className="text-link" onClick={() => setActiveTab('clubs')}>View all →</button>
                      </div>
                      <div className="recent-clubs-list">
                        {clubs.slice(0, 3).map(club => (
                          <div key={club.id} className="recent-club-row">
                            <img src={club.imageUrl || '/placeholder.jpg'} alt={club.name} className="recent-club-img" onError={e => e.target.src = '/placeholder.jpg'} />
                            <div className="recent-club-info">
                              <strong>{club.name}</strong>
                              <span>{club.category}</span>
                            </div>
                            {club.isVerified && <CheckCircle size={16} style={{ color: 'var(--accent-green)', flexShrink: 0 }} title="Verified" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── MY CLUBS TAB ──────────────────────── */}
              {activeTab === 'clubs' && (
                <motion.div className="dashboard-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="section-header">
                    <h2>My Communities</h2>
                    <Link to="/add-club"><Button variant="primary" size="small"><PlusCircle size={16} /> Add Club</Button></Link>
                  </div>

                  {clubs.length === 0 ? (
                    <div className="empty-state glass-panel">
                      <Users size={48} className="empty-icon" />
                      <h3>No clubs yet</h3>
                      <p>Register your first community and get discovered by Vijayawada!</p>
                      <Link to="/add-club"><Button variant="primary">Create Your First Club</Button></Link>
                    </div>
                  ) : (
                    <div className="manage-clubs-list">
                      {clubs.map(club => (
                        <div key={club.id} className="manage-club-card glass-panel">
                          <img src={club.imageUrl || '/placeholder.jpg'} alt={club.name} className="manage-club-img"
                            onError={e => e.target.src = '/placeholder.jpg'} />
                          <div className="manage-club-info">
                            <div className="manage-club-title">
                              <h4>{club.name}</h4>
                              {club.isVerified && (
                                <span className="verified-badge"><CheckCircle size={14} /> Verified</span>
                              )}
                            </div>
                            <span className="manage-club-cat">{club.category}</span>
                            {club.location && <span className="manage-club-loc"><MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} /> {club.location}</span>}
                          </div>
                          <div className="manage-card-actions">
                            <Button variant="outline" size="small" onClick={() => navigate(`/edit-club/${club.id}`)}>
                              <Pencil size={14} /> Edit
                            </Button>
                            <Button size="small" variant="outline"
                              style={{ borderColor: 'var(--accent-pink)', color: 'var(--accent-pink)' }}
                              onClick={() => setDeleteTarget({ type: 'club', id: club.id, name: club.name })}>
                              <Trash2 size={14} /> Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── MANAGE EVENTS TAB ─────────────────── */}
              {activeTab === 'events' && (
                <motion.div className="dashboard-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="section-header">
                    <h2>Hosted Events</h2>
                    <Link to="/add-event"><Button variant="primary" size="small"><PlusCircle size={16} /> Host Event</Button></Link>
                  </div>

                  {events.length === 0 ? (
                    <div className="empty-state glass-panel">
                      <CalendarIcon size={48} className="empty-icon" />
                      <h3>No events yet</h3>
                      <p>Create your first event and bring the community together.</p>
                      <Link to="/add-event"><Button variant="primary">Host Your First Event</Button></Link>
                    </div>
                  ) : (
                    <div className="events-list">
                      {events.map(event => {
                        const past = isEventPast(event.date);
                        const tickets = event.tickets || [];
                        const totalSold = tickets.reduce((s, t) => s + (t.sold || 0), 0);
                        const totalCap = tickets.reduce((s, t) => s + (t.capacity || 0), 0);

                        return (
                          <div key={event.id} className={'admin-event-card glass-panel ' + (past ? 'event-past' : '')}>
                            <img src={event.image_url || '/placeholder.jpg'} alt={event.title}
                              className="admin-event-img" onError={e => e.target.src = '/placeholder.jpg'} />
                            <div className="admin-event-info">
                              <div className="admin-event-title-row">
                                <h4>{event.title}</h4>
                                <span className={'event-status-badge ' + (past ? 'badge-past' : 'badge-upcoming')}>
                                  {past ? <><Clock size={12} /> Past</> : <><CheckCircle size={12} /> Upcoming</>}
                                </span>
                              </div>
                              <p className="admin-event-meta">
                                {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                {event.clubs?.name && (' • ' + event.clubs.name)}
                              </p>
                              {tickets.length > 0 && (
                                <div className="ticket-stat">
                                  <TicketIcon size={13} />
                                  <span>{totalSold} / {totalCap} tickets sold</span>
                                  <div className="ticket-bar">
                                    <div className="ticket-bar-fill" style={{ width: (totalCap ? (totalSold / totalCap) * 100 : 0) + '%' }} />
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="admin-event-actions">
                              {!past && (
                                <Button variant="outline" size="small" onClick={() => navigate('/edit-event/' + event.id)}>
                                  <Pencil size={14} /> Edit
                                </Button>
                              )}
                              <Button size="small" variant="outline"
                                style={{ borderColor: 'var(--accent-pink)', color: 'var(--accent-pink)' }}
                                onClick={() => setDeleteTarget({ type: 'event', id: event.id, name: event.title })}>
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── SCANNER TAB ──────────────────────── */}
              {activeTab === 'scanner' && (
                <motion.div className="dashboard-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {!selectedScannerEvent ? (
                    <div className="scanner-selector glass-panel">
                      <h3 style={{ marginBottom: '1rem' }}>Select Event to Scan Tickets For</h3>
                      <div className="event-scanner-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {upcomingEvents.length === 0 ? (
                          <p style={{ color: 'var(--text-secondary)' }}>You have no upcoming events to scan tickets for.</p>
                        ) : (
                          upcomingEvents.map(event => (
                            <button 
                              key={event.id}
                              className="brutalist-button" 
                              onClick={() => setSelectedScannerEvent(event.id)}
                              style={{ textAlign: 'left', padding: '15px' }}
                            >
                              <div style={{ fontWeight: 'bold' }}>{event.title}</div>
                              <div style={{ fontSize: '0.85rem', color: '#fff', opacity: 0.8 }}>
                                {new Date(event.date).toLocaleDateString()}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="scanner-active-view">
                      <button className="text-link" onClick={() => setSelectedScannerEvent(null)} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        ← Back to Events List
                      </button>
                      <TicketScanner eventId={selectedScannerEvent} />
                    </div>
                  )}
                </motion.div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ClubManagerPage;
