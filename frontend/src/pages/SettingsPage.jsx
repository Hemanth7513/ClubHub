/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Lock, Users, Calendar, Trash2, ShieldAlert, KeyRound, Eye, EyeOff } from 'lucide-react';
import Button from '../components/Button/Button';
import API_BASE_URL from '../config';
import './SettingsPage.css';

const SettingsPage = () => {
  const { user, token, profile, updateProfileState, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Profile state
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');
  
  // Preference state
  const [themePreference, setThemePreference] = useState('light');
  const [notificationsEnabled, setNotificationsEnabled] = useState(profile?.notificationsEnabled !== false);
  
  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  
  // Delete account state
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // User creations state
  const [myClubs, setMyClubs] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [fetchingCreations, setFetchingCreations] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (profile) {
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatarUrl || '');
      setThemePreference('light');
      setNotificationsEnabled(profile.notificationsEnabled !== false);
    }
  }, [profile]);

  useEffect(() => {
    if (activeTab === 'communities' && token) {
      fetchUserCreations();
    }
  }, [activeTab, token]);

  const fetchUserCreations = async () => {
    try {
      setFetchingCreations(true);
      
      const clubsRes = await fetch(`${API_BASE_URL}/users/clubs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const eventsRes = await fetch(`${API_BASE_URL}/users/events`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (clubsRes.ok && eventsRes.ok) {
        setMyClubs(await clubsRes.json());
        setMyEvents(await eventsRes.json());
      }
    } catch (err) {
      console.error("Error fetching creations:", err);
    } finally {
      setFetchingCreations(false);
    }
  };

  const showFeedback = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          bio,
          avatarUrl,
          themePreference,
          notificationsEnabled
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      
      updateProfileState({ ...user, name }, { bio, avatarUrl, themePreference, notificationsEnabled });
      showFeedback('Profile settings updated successfully!');
    } catch (err) {
      showFeedback(err.message, 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showFeedback('New passwords do not match!', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showFeedback('New password must be at least 8 characters.', 'error');
      return;
    }
    
    setPasswordLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showFeedback('Password changed successfully! Please log in again.');
      setTimeout(() => { logout(); navigate('/login'); }, 2000);
    } catch (err) {
      showFeedback(err.message, 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: deleteConfirmPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        // Friendly hint for OTP-only accounts
        const msg = data.error?.includes('OTP')
          ? 'OTP accounts cannot be deleted via password. Please contact support.'
          : (data.error || 'Account deletion failed');
        throw new Error(msg);
      }

      setShowDeleteModal(false);
      logout();
      navigate('/');
    } catch (err) {
      showFeedback(err.message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteClub = async (clubId) => {
    if (!window.confirm("Are you sure you want to delete this community? This action is permanent!")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/clubs/${clubId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMyClubs(prev => prev.filter(c => c.id !== clubId));
        showFeedback('Community deleted successfully!');
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete club');
      }
    } catch (err) {
      showFeedback(err.message, 'error');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event? This action is permanent!")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMyEvents(prev => prev.filter(e => e.id !== eventId));
        showFeedback('Event deleted successfully!');
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete event');
      }
    } catch (err) {
      showFeedback(err.message, 'error');
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile Details', icon: <User size={18} /> },
    { id: 'communities', name: 'My Hubs', icon: <Users size={18} /> },
    { id: 'security', name: 'Security & Access', icon: <Lock size={18} /> }
  ];

  return (
    <div className="container settings-page">
      <motion.div 
        className="settings-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="settings-eyebrow">Personal Dashboard</span>
        <h1 className="text-gradient">Account Settings</h1>
        <p>Manage your profile, registered clubs, preferences, and security credentials.</p>
      </motion.div>

      <AnimatePresence>
        {message.text && (
          <motion.div 
            className={`feedback-banner ${message.type === 'error' ? 'banner-error' : 'banner-success'}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="settings-layout">
        {/* Sidebar Nav */}
        <aside className="settings-sidebar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </aside>

        {/* Tab Panel Content */}
        <main className="settings-panel">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile-tab"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="panel-content"
              >
                <h2>Edit Profile</h2>
                <p className="panel-desc">Update your display information seen by the community.</p>
                
                <form onSubmit={handleUpdateProfile} className="settings-form">
                  <div className="form-group">
                    <label>Display Name</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      value={user?.email || ''} 
                      disabled 
                      className="disabled-input" 
                    />
                    <span className="input-hint">Email address cannot be changed.</span>
                  </div>

                  <div className="form-group">
                    <label>Profile Biography</label>
                    <textarea 
                      placeholder="Tell the community about yourself, your role, or interest..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label>Avatar Image URL</label>
                    <input 
                      type="url" 
                      placeholder="https://example.com/avatar.jpg" 
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                    />
                    {avatarUrl && (
                      <div className="avatar-preview-wrapper">
                        <img
                          src={avatarUrl}
                          alt="Avatar Preview"
                          className="avatar-preview-img"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                        <span className="avatar-preview-label">Preview</span>
                      </div>
                    )}
                  </div>

                  <div className="checkbox-group" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                    <input 
                      type="checkbox" 
                      id="notif_pref" 
                      checked={notificationsEnabled}
                      onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    />
                    <label htmlFor="notif_pref">
                      <strong>Enable Email Notifications</strong>
                      <span>Receive email digests and alerts for upcoming events of your joined clubs.</span>
                    </label>
                  </div>

                  <Button type="submit" variant="primary" disabled={profileLoading}>
                    {profileLoading ? 'Saving Changes...' : 'Save Settings'}
                  </Button>
                </form>
              </motion.div>
            )}

            {activeTab === 'communities' && (
              <motion.div
                key="communities-tab"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="panel-content"
              >
                <h2>My Communities & Events</h2>
                <p className="panel-desc">Edit or delete directory clubs and events you registered.</p>

                {fetchingCreations ? (
                  <div className="panel-loader"><div className="spinner"></div></div>
                ) : (
                  <div className="creations-lists">
                    <section className="creations-section">
                      <h3><Users size={16} /> Registered Clubs ({myClubs.length})</h3>
                      {myClubs.length === 0 ? (
                        <p className="no-items">You have not registered any clubs yet.</p>
                      ) : (
                        <div className="item-action-list">
                          {myClubs.map(club => (
                            <div key={club.id} className="action-item">
                              <div className="item-info">
                                <h4>{club.name}</h4>
                                <span>{club.category}</span>
                              </div>
                              <button onClick={() => handleDeleteClub(club.id)} className="delete-action-btn" title="Delete Club">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>

                    <section className="creations-section">
                      <h3><Calendar size={16} /> Registered Events ({myEvents.length})</h3>
                      {myEvents.length === 0 ? (
                        <p className="no-items">You have not registered any events yet.</p>
                      ) : (
                        <div className="item-action-list">
                          {myEvents.map(event => (
                            <div key={event.id} className="action-item">
                              <div className="item-info">
                                <h4>{event.title}</h4>
                                <span>{new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                              </div>
                              <button onClick={() => handleDeleteEvent(event.id)} className="delete-action-btn" title="Delete Event">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  </div>
                )}
              </motion.div>
            )}



            {activeTab === 'security' && (
              <motion.div
                key="security-tab"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="panel-content"
              >
                <h2>Security & Access</h2>
                <p className="panel-desc">Manage credentials and control account deletion.</p>

                <form onSubmit={handleChangePassword} className="settings-form">
                  <h3>Change Password</h3>
                  <div className="form-group">
                    <label>Current Password</label>
                    <div className="password-input-wrapper">
                      <input 
                        type={showCurrentPass ? 'text' : 'password'} 
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required 
                      />
                      <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} className="pass-toggle">
                        {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>New Password</label>
                    <div className="password-input-wrapper">
                      <input 
                        type={showNewPass ? 'text' : 'password'} 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required 
                      />
                      <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="pass-toggle">
                        {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required 
                    />
                  </div>

                  <Button type="submit" variant="primary" disabled={passwordLoading}>
                    Update Password <KeyRound size={16} style={{ marginLeft: '0.5rem' }} />
                  </Button>
                </form>

                <div className="danger-zone">
                  <h3>Danger Zone</h3>
                  <p>Permanently remove your account, profile details, and creations from the community directory.</p>
                  <button 
                    type="button" 
                    className="danger-action-btn"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Delete Account
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Delete Account Modal Confirmation */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="brutalist-modal">
            <div className="modal-header">
              <ShieldAlert size={24} className="danger-icon" />
              <h3>Delete Account?</h3>
            </div>
            <p>This action is irreversible. All your listings and metadata will be permanently deleted.</p>
            <form onSubmit={handleDeleteAccount}>
              <div className="form-group">
                <label>Confirm Password to Delete Account</label>
                <input 
                  type="password" 
                  value={deleteConfirmPassword}
                  onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                  placeholder="Enter password"
                  required 
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-modal-btn" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="confirm-delete-btn" disabled={deleteLoading}>
                  {deleteLoading ? 'Deleting...' : 'Permanently Delete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
