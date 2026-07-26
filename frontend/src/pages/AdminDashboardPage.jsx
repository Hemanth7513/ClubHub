import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2, Users, ShieldAlert, Calendar, CheckCircle,
  Clock, BarChart2, AlertTriangle, RefreshCw, Settings, LogOut, Ticket
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button/Button';
import API_BASE_URL from '../config';
import './AdminDashboardPage.css';

/* ─── Confirm delete modal ─────────────────── */
const ConfirmModal = ({ message, onConfirm, onCancel, loading }) => (
  <div className="admin-confirm-overlay">
    <motion.div
      className="admin-confirm-modal glass-panel"
      initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.85, opacity: 0 }}
    >
      <AlertTriangle size={36} style={{ color: 'var(--accent-pink)' }} />
      <p>{message}</p>
      <div className="admin-confirm-actions">
        <Button variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button variant="primary" onClick={onConfirm} disabled={loading}
          style={{ background: 'var(--accent-pink)', border: '3px solid var(--border-dark)' }}>
          {loading ? 'Deleting...' : 'Confirm Delete'}
        </Button>
      </div>
    </motion.div>
  </div>
);

const AdminDashboardPage = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, clubs: 0, events: 0, revenue: 0 });
  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'clubs' | 'users'
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchAdminData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, usersRes, clubsRes, eventsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/stats`, { headers }),
        fetch(`${API_BASE_URL}/admin/users`, { headers }),
        fetch(`${API_BASE_URL}/admin/clubs`, { headers }),
        fetch(`${API_BASE_URL}/admin/events`, { headers })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (clubsRes.ok) setClubs(await clubsRes.json());
      if (eventsRes.ok) setEvents(await eventsRes.json());
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { fetchAdminData(); }, [fetchAdminData]);

  const handleDeleteTarget = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const url = deleteTarget.type === 'event'
        ? `${API_BASE_URL}/admin/events/${deleteTarget.id}`
        : `${API_BASE_URL}/admin/clubs/${deleteTarget.id}`;

      const res = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        if (deleteTarget.type === 'event') {
          setEvents(prev => prev.filter(e => e.id !== deleteTarget.id));
          setStats(prev => ({ ...prev, events: Math.max(0, prev.events - 1) }));
        } else {
          setClubs(prev => prev.filter(c => c.id !== deleteTarget.id));
          setStats(prev => ({ ...prev, clubs: Math.max(0, prev.clubs - 1) }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const handleToggleVerify = async (club) => {
    const newValue = !club.is_verified;
    // Optimistic update
    setClubs(prev => prev.map(c => c.id === club.id ? { ...c, is_verified: newValue } : c));
    try {
      const res = await fetch(`${API_BASE_URL}/admin/clubs/${club.id}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ is_verified: newValue })
      });
      if (!res.ok) {
        // Revert on failure
        setClubs(prev => prev.map(c => c.id === club.id ? { ...c, is_verified: !newValue } : c));
      }
    } catch (err) {
      setClubs(prev => prev.map(c => c.id === club.id ? { ...c, is_verified: !newValue } : c));
    }
  };

  const pendingClubs = clubs.filter(c => !c.is_verified);
  const verifiedClubs = clubs.filter(c => c.is_verified);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner" />
        <p>Loading admin data...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'pending', label: 'Pending Verification', icon: <Clock size={16} />, count: pendingClubs.length },
    { id: 'clubs', label: 'All Clubs', icon: <Users size={16} />, count: clubs.length },
    { id: 'events', label: 'All Events', icon: <Calendar size={16} />, count: events.length },
    { id: 'users', label: 'All Users', icon: <Users size={16} />, count: users.length },
  ];

  return (
    <div className="admin-dashboard container">
      <AnimatePresence>
        {deleteTarget && (
          <ConfirmModal
            message={`Permanently delete "${deleteTarget.name}"? This cannot be undone.`}
            onConfirm={handleDeleteTarget}
            onCancel={() => setDeleteTarget(null)}
            loading={deleteLoading}
          />
        )}
      </AnimatePresence>

      <motion.div className="admin-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="admin-header-row">
          <div>
            <h1 className="text-gradient">
              <ShieldAlert size={34} style={{ verticalAlign: 'middle', marginRight: 10 }} />
              Owner Platform
            </h1>
            <p>Global oversight of Vijayawada City Voice.</p>
          </div>
          <Button variant="outline" size="small" onClick={() => fetchAdminData(true)} disabled={refreshing}>
            <RefreshCw size={15} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </motion.div>

      {/* ── Admin Profile Section ───────────────── */}
      <motion.div className="admin-profile-section glass-panel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="admin-profile-details">
          <div className="admin-profile-avatar">
            {user?.name ? user.name[0].toUpperCase() : 'A'}
          </div>
          <div className="admin-profile-info">
            <h3>{user?.name || 'Administrator'}</h3>
            <p>{user?.email}</p>
            <span className="badge badge-admin">{user?.role}</span>
          </div>
        </div>
        <div className="admin-profile-actions">
          <Button variant="outline" onClick={() => navigate('/settings')}>
            <Settings size={16} style={{ marginRight: '6px' }} /> Settings
          </Button>
          <Button variant="outline" onClick={() => { logout(); navigate('/'); }}>
            <LogOut size={16} style={{ marginRight: '6px' }} /> Logout
          </Button>
        </div>
      </motion.div>

      {/* ── Stats Grid ──────────────────────── */}
      <motion.div
        className="admin-stats-grid"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="admin-stat-card glass-panel">
          <div className="admin-stat-icon"><Users size={22} /></div>
          <div>
            <h4>Total Users</h4>
            <h2>{stats.users}</h2>
          </div>
        </div>
        <div className="admin-stat-card glass-panel">
          <div className="admin-stat-icon"><Calendar size={22} /></div>
          <div>
            <h4>Total Clubs</h4>
            <h2>{stats.clubs}</h2>
          </div>
        </div>
        <div className="admin-stat-card glass-panel">
          <div className="admin-stat-icon"><BarChart2 size={22} /></div>
          <div>
            <h4>Total Events</h4>
            <h2>{stats.events}</h2>
          </div>
        </div>
        <div className="admin-stat-card glass-panel accent-card">
          <div className="admin-stat-icon"><Clock size={22} /></div>
          <div>
            <h4>Pending Verify</h4>
            <h2>{pendingClubs.length}</h2>
          </div>
        </div>
      </motion.div>

      {/* ── Tabs ────────────────────────────── */}
      <div className="admin-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
            <span className="admin-tab-badge">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* ── Tab Content ─────────────────────── */}
      <motion.div
        className="admin-table-container"
        key={activeTab}
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      >

        {/* PENDING VERIFICATION */}
        {activeTab === 'pending' && (
          pendingClubs.length === 0 ? (
            <div className="admin-empty">
              <CheckCircle size={44} style={{ color: 'var(--accent-green)' }} />
              <h3>All Clear!</h3>
              <p>No clubs pending verification. Every registered club has been reviewed.</p>
            </div>
          ) : (
            <div className="admin-card-list">
              {pendingClubs.map(club => (
                <div key={club.id} className="admin-club-card glass-panel">
                  <img
                    src={club.image_url || 'https://via.placeholder.com/80x60'}
                    alt={club.name} className="admin-club-thumb"
                    onError={e => e.target.src = 'https://via.placeholder.com/80x60'}
                  />
                  <div className="admin-club-info">
                    <h4>{club.name}</h4>
                    <span className="admin-club-cat">{club.category}</span>
                    <span className="admin-club-owner">
                      By: {club.users ? (club.users.name || club.users.email) : 'Unknown'}
                    </span>
                  </div>
                  <div className="admin-club-actions">
                    <Button variant="primary" size="small" onClick={() => handleToggleVerify(club)}>
                      <CheckCircle size={14} /> Verify
                    </Button>
                    <Button size="small" variant="outline"
                      style={{ borderColor: 'var(--accent-pink)', color: 'var(--accent-pink)' }}
                      onClick={() => setDeleteTarget({ id: club.id, name: club.name, type: 'club' })}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ALL CLUBS */}
        {activeTab === 'clubs' && (
          <>
            {/* Desktop table */}
            <table className="admin-table admin-table-desktop">
              <thead>
                <tr>
                  <th>Club Name</th>
                  <th>Category</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clubs.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 700 }}>{c.name}</td>
                    <td>{c.category}</td>
                    <td>{c.users ? (c.users.name || c.users.email) : '—'}</td>
                    <td>
                      {c.is_verified
                        ? <span className="badge badge-verified"><CheckCircle size={12} /> Verified</span>
                        : <span className="badge badge-pending"><Clock size={12} /> Pending</span>
                      }
                    </td>
                    <td>
                      <div className="admin-action-row">
                        <button
                          className={`admin-verify-btn ${c.is_verified ? 'is-verified' : ''}`}
                          onClick={() => handleToggleVerify(c)}
                          title={c.is_verified ? 'Unverify' : 'Verify'}
                        >
                          <CheckCircle size={14} /> {c.is_verified ? 'Unverify' : 'Verify'}
                        </button>
                        <button className="admin-delete-btn" onClick={() => setDeleteTarget({ id: c.id, name: c.name, type: 'club' })} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {clubs.length === 0 && <tr><td colSpan="5" className="admin-empty-cell">No clubs found</td></tr>}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="admin-card-list admin-card-mobile">
              {clubs.map(c => (
                <div key={c.id} className="admin-club-card glass-panel">
                  <img src={c.image_url || 'https://via.placeholder.com/80x60'} alt={c.name}
                    className="admin-club-thumb" onError={e => e.target.src = 'https://via.placeholder.com/80x60'} />
                  <div className="admin-club-info">
                    <h4>{c.name}</h4>
                    <span className="admin-club-cat">{c.category}</span>
                    {c.is_verified
                      ? <span className="badge badge-verified"><CheckCircle size={11} /> Verified</span>
                      : <span className="badge badge-pending"><Clock size={11} /> Pending</span>
                    }
                  </div>
                  <div className="admin-club-actions">
                    <button className={`admin-verify-btn ${c.is_verified ? 'is-verified' : ''}`}
                      onClick={() => handleToggleVerify(c)}>
                      <CheckCircle size={13} /> {c.is_verified ? 'Unverify' : 'Verify'}
                    </button>
                    <button className="admin-delete-btn" onClick={() => setDeleteTarget({ id: c.id, name: c.name, type: 'club' })}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ALL EVENTS */}
        {activeTab === 'events' && (
          <>
            <table className="admin-table admin-table-desktop">
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Club</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(e => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 700 }}>{e.title}</td>
                    <td>{e.clubs?.name || 'Unknown'}</td>
                    <td>{new Date(e.date).toLocaleDateString()}</td>
                    <td>
                      <div className="admin-action-row">
                        <button className="admin-delete-btn" onClick={() => setDeleteTarget({ id: e.id, name: e.title, type: 'event' })} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {events.length === 0 && <tr><td colSpan="4" className="admin-empty-cell">No events found</td></tr>}
              </tbody>
            </table>
            
            <div className="admin-card-list admin-card-mobile">
              {events.map(e => (
                <div key={e.id} className="admin-club-card glass-panel">
                  <div className="admin-club-info">
                    <h4>{e.title}</h4>
                    <span className="admin-club-cat">{e.clubs?.name || 'Unknown'}</span>
                    <span className="admin-club-cat"><Calendar size={12}/> {new Date(e.date).toLocaleDateString()}</span>
                  </div>
                  <div className="admin-club-actions">
                    <button className="admin-delete-btn" onClick={() => setDeleteTarget({ id: e.id, name: e.title, type: 'event' })}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ALL USERS */}
        {activeTab === 'users' && (
          <>
            {/* Desktop table */}
            <table className="admin-table admin-table-desktop">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 700 }}>{u.name || 'Anonymous'}</td>
                    <td style={{ fontSize: '0.9rem' }}>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan="4" className="admin-empty-cell">No users found</td></tr>}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="admin-user-cards admin-card-mobile">
              {users.map(u => (
                <div key={u.id} className="admin-user-card glass-panel">
                  <div className="admin-user-avatar">{(u.name || 'A')[0].toUpperCase()}</div>
                  <div className="admin-user-info">
                    <strong>{u.name || 'Anonymous'}</strong>
                    <span>{u.email}</span>
                    <div className="admin-user-meta">
                      <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>{u.role}</span>
                      <span className="admin-user-date">
                        {new Date(u.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default AdminDashboardPage;
