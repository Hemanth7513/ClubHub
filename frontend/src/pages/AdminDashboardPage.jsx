import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Users, ShieldAlert, Calendar, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config';
import './AdminDashboardPage.css';

const AdminDashboardPage = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({ users: 0, clubs: 0, events: 0, revenue: 0 });
  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'clubs'

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [statsRes, usersRes, clubsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/stats`, { headers }),
        fetch(`${API_BASE_URL}/admin/users`, { headers }),
        fetch(`${API_BASE_URL}/admin/clubs`, { headers })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (clubsRes.ok) setClubs(await clubsRes.json());
      
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClub = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this club?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/clubs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setClubs(prev => prev.filter(c => c.id !== id));
        setStats(prev => ({ ...prev, clubs: prev.clubs - 1 }));
      } else {
        alert("Failed to delete club.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleVerify = async (club) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/clubs/${club.id}/verify`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ is_verified: !club.is_verified })
      });
      if (res.ok) {
        setClubs(prev => prev.map(c => c.id === club.id ? { ...c, is_verified: !club.is_verified } : c));
      } else {
        alert("Failed to update verification status.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="spinner" style={{ margin: 'auto', marginTop: '20vh' }}></div>;
  }

  return (
    <div className="admin-dashboard container">
      <motion.div 
        className="admin-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-gradient"><ShieldAlert size={36} style={{ verticalAlign: 'middle', marginRight: '10px' }} /> Owner Platform</h1>
        <p>Global oversight of Vijayawada City Voice.</p>
      </motion.div>

      <motion.div 
        className="admin-stats-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="stat-card">
          <h3>Total Users</h3>
          <div className="stat-value">{stats.users}</div>
        </div>
        <div className="stat-card">
          <h3>Total Clubs</h3>
          <div className="stat-value">{stats.clubs}</div>
        </div>
        <div className="stat-card">
          <h3>Total Events</h3>
          <div className="stat-value">{stats.events}</div>
        </div>
        <div className="stat-card">
          <h3>Platform Revenue</h3>
          <div className="stat-value">₹{stats.revenue.toFixed(2)}</div>
        </div>
      </motion.div>

      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={18} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} /> Users Directory
        </button>
        <button 
          className={`admin-tab ${activeTab === 'clubs' ? 'active' : ''}`}
          onClick={() => setActiveTab('clubs')}
        >
          <Calendar size={18} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} /> Clubs Directory
        </button>
      </div>

      <motion.div 
        className="admin-table-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        key={activeTab}
      >
        {activeTab === 'users' ? (
          <table className="admin-table">
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
                  <td style={{ fontWeight: 600 }}>{u.name || 'Anonymous'}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className="badge" style={{ margin: 0, background: u.role === 'admin' ? 'var(--accent-pink)' : '', color: u.role === 'admin' ? 'white' : '' }}>
                      {u.role}
                    </span>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center' }}>No users found</td></tr>}
            </tbody>
          </table>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Club Name</th>
                <th>Category</th>
                <th>Creator (User)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clubs.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>{c.category}</td>
                  <td>{c.users ? c.users.name || c.users.email : 'Unknown'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => handleToggleVerify(c)} 
                        className={`badge ${c.is_verified ? 'verified' : ''}`}
                        style={{ border: 'none', cursor: 'pointer', background: c.is_verified ? 'var(--accent-blue)' : 'var(--bg-secondary)', color: c.is_verified ? 'white' : 'var(--text-secondary)' }}
                        title="Toggle Verification"
                      >
                        <CheckCircle size={16} /> {c.is_verified ? 'Verified' : 'Verify'}
                      </button>
                      <button onClick={() => handleDeleteClub(c.id)} className="delete-btn" title="Delete Club">
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {clubs.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center' }}>No clubs found</td></tr>}
            </tbody>
          </table>
        )}
      </motion.div>

    </div>
  );
};

export default AdminDashboardPage;
