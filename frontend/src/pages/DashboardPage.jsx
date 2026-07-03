import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Users, Calendar as CalendarIcon, Activity, Settings, PlusCircle, LayoutDashboard, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../config';
import ClubCard from '../components/ClubCard/ClubCard';
import Button from '../components/Button/Button';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const [clubsRes, eventsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/users/clubs`, { headers }),
          fetch(`${API_BASE_URL}/users/events`, { headers })
        ]);

        if (clubsRes.ok) {
          const clubsData = await clubsRes.json();
          setClubs(clubsData);
        }
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setEvents(eventsData);
        }
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  return (
    <div className="dashboard-page">
      <div className="container dashboard-container">
        
        {/* Sidebar */}
        <aside className="dashboard-sidebar glass-panel">
          <div className="sidebar-header">
            <h3>Admin Panel</h3>
          </div>
          <nav className="sidebar-nav">
            <button 
              className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <LayoutDashboard size={18} /> Overview
            </button>
            <button 
              className={`sidebar-link ${activeTab === 'clubs' ? 'active' : ''}`}
              onClick={() => setActiveTab('clubs')}
            >
              <Users size={18} /> My Clubs
            </button>
            <button 
              className={`sidebar-link ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => setActiveTab('events')}
            >
              <CalendarIcon size={18} /> Manage Events
            </button>
            <Link to="/settings" className="sidebar-link">
              <Settings size={18} /> Settings
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="dashboard-content">
          <motion.div 
            className="dashboard-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="title-xl">Welcome, <span className="editorial-font" style={{ background: 'var(--accent-yellow)', padding: '0 10px', border: '3px solid var(--border-dark)', boxShadow: '4px 4px 0px var(--border-dark)' }}>{user?.name?.split(' ')[0] || 'Admin'}</span></h1>
            <p>Manage your communities and events from one central hub.</p>
          </motion.div>

          <div className="marquee-container" style={{ marginBottom: '2rem' }}>
            <div className="marquee-content">
              CONNECT • ORGANIZE • DISCOVER • VIJAYAWADA CITY VOICE • NO DARK PATTERNS • PURE BRUTALISM • CONNECT • ORGANIZE • DISCOVER • VIJAYAWADA CITY VOICE
            </div>
            <div className="marquee-content" aria-hidden="true">
              CONNECT • ORGANIZE • DISCOVER • VIJAYAWADA CITY VOICE • NO DARK PATTERNS • PURE BRUTALISM • CONNECT • ORGANIZE • DISCOVER • VIJAYAWADA CITY VOICE
            </div>
          </div>

          {loading ? (
            <div className="spinner" style={{ margin: '4rem auto' }}></div>
          ) : (
            <>
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <motion.div 
                  className="dashboard-tab"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                >
                  <div className="stats-grid">
                    <div className="stat-card glass-panel">
                      <div className="stat-icon"><Users size={24} /></div>
                      <div className="stat-info">
                        <h4>Total Clubs</h4>
                        <h2>{clubs.length}</h2>
                      </div>
                    </div>
                    <div className="stat-card glass-panel">
                      <div className="stat-icon"><CalendarIcon size={24} /></div>
                      <div className="stat-info">
                        <h4>Active Events</h4>
                        <h2>{events.length}</h2>
                      </div>
                    </div>
                    <div className="stat-card glass-panel">
                      <div className="stat-icon"><Activity size={24} /></div>
                      <div className="stat-info">
                        <h4>Total Members</h4>
                        <h2>--</h2>
                      </div>
                    </div>
                  </div>

                  <div className="quick-actions glass-panel">
                    <h3>Quick Actions</h3>
                    <div className="action-buttons">
                      <Link to="/add-club"><Button variant="primary"><PlusCircle size={18}/> New Club</Button></Link>
                      <Link to="/add-event"><Button variant="outline"><CalendarIcon size={18}/> Host Event</Button></Link>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* MY CLUBS TAB */}
              {activeTab === 'clubs' && (
                <motion.div 
                  className="dashboard-tab"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                >
                  <div className="section-header">
                    <h2>My Communities</h2>
                    <Link to="/add-club"><Button variant="primary" size="small"><PlusCircle size={16}/> Add Club</Button></Link>
                  </div>
                  
                  {clubs.length === 0 ? (
                    <div className="empty-state glass-panel">
                      <Users size={48} className="empty-icon" />
                      <h3>No clubs found</h3>
                      <p>You haven't created any clubs yet.</p>
                      <Link to="/add-club"><Button variant="primary">Create Your First Club</Button></Link>
                    </div>
                  ) : (
                    <div className="clubs-grid">
                      {clubs.map((club, i) => (
                        <ClubCard key={club.id} club={club} index={i} />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* MANAGE EVENTS TAB */}
              {activeTab === 'events' && (
                <motion.div 
                  className="dashboard-tab"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                >
                  <div className="section-header">
                    <h2>Hosted Events</h2>
                    <Link to="/add-event"><Button variant="primary" size="small"><PlusCircle size={16}/> Host Event</Button></Link>
                  </div>

                  {events.length === 0 ? (
                    <div className="empty-state glass-panel">
                      <CalendarIcon size={48} className="empty-icon" />
                      <h3>No events found</h3>
                      <p>You haven't hosted any events yet.</p>
                      <Link to="/add-event"><Button variant="primary">Host Your First Event</Button></Link>
                    </div>
                  ) : (
                    <div className="events-list">
                      {events.map((event) => (
                        <div key={event.id} className="admin-event-card glass-panel">
                          <img src={event.image_url} alt={event.title} className="admin-event-img" />
                          <div className="admin-event-info">
                            <h4>{event.title}</h4>
                            <p className="admin-event-meta">{new Date(event.date).toLocaleDateString()} • {event.clubs?.name}</p>
                          </div>
                          <div className="admin-event-actions">
                            <Button variant="outline" size="small">Edit</Button>
                          </div>
                        </div>
                      ))}
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

export default DashboardPage;
