import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button/Button';
import API_BASE_URL from '../config';
import './AddClubPage.css';
import './EditClubPage.css';

const EVENT_CATEGORIES = ['Gala', 'Workshop', 'Sports', 'Nightlife', 'Meetup', 'Conference', 'Exhibition', 'Fundraiser'];

const EditEventPage = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    clubId: '', title: '', description: '',
    date: '', location: '', imageUrl: '', category: ''
  });
  const [userClubs, setUserClubs] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!user) { navigate('/login'); return; }

    const fetchData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch event + user's own clubs in parallel
        const [eventRes, clubsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/events/${id}`),
          fetch(`${API_BASE_URL}/users/clubs`, { headers })
        ]);

        if (!eventRes.ok) throw new Error('Event not found');
        const event = await eventRes.json();

        // Only the creator can edit
        if (event.user_id && event.user_id !== user.id) {
          setUnauthorized(true);
          return;
        }

        if (clubsRes.ok) {
          const clubs = await clubsRes.json();
          setUserClubs(clubs);
        }

        // Format date for datetime-local input
        const dateStr = event.date ? new Date(event.date).toISOString().slice(0, 16) : '';

        setFormData({
          clubId: event.club_id ? String(event.club_id) : '',
          title: event.title || '',
          description: event.description || '',
          date: dateStr,
          location: event.location || '',
          imageUrl: event.image_url || '',
          category: event.category || ''
        });
      } catch (err) {
        setError('Failed to load event details.');
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id, user, token, navigate]);

  const validate = () => {
    const errors = {};
    if (!formData.clubId) errors.clubId = 'Please select a club';
    if (!formData.title.trim()) errors.title = 'Event title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.date) errors.date = 'Date and time are required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (!formData.category) errors.category = 'Please select a category';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update event');
      }
      setSuccess(true);
      setTimeout(() => navigate('/manage-clubs'), 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="edit-club-loading">
        <Loader size={40} className="spinner-icon" />
        <p>Loading event details...</p>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="container edit-club-page">
        <div className="edit-unauthorized glass-panel">
          <AlertCircle size={48} />
          <h2>Access Denied</h2>
          <p>You can only edit events you have created.</p>
          <Button variant="primary" onClick={() => navigate('/manage-clubs')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container add-club-page">
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <button className="back-btn" onClick={() => navigate('/manage-clubs')}>
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
        <h1 className="text-gradient">Edit Event</h1>
        <p>Update your event's details. Changes reflect immediately on the events page.</p>
      </motion.div>

      {success && (
        <motion.div className="success-message" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <CheckCircle size={20} style={{ display: 'inline', marginRight: 8 }} />
          Event updated successfully! Redirecting to dashboard...
        </motion.div>
      )}
      {error && (
        <motion.div className="error-message" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <AlertCircle size={20} style={{ display: 'inline', marginRight: 8 }} />
          {error}
        </motion.div>
      )}

      <motion.div
        className="form-container"
        initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        {/* Banner preview */}
        {formData.imageUrl && (
          <div className="image-preview-wrap">
            <img src={formData.imageUrl} alt="Event banner preview" className="image-preview"
              onError={e => e.target.style.display = 'none'} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="club-form" noValidate>
          {/* Row 1: Club + Category */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="clubId">Your Club *</label>
              <select id="clubId" name="clubId" value={formData.clubId}
                onChange={handleChange} className={formErrors.clubId ? 'input-error' : ''}>
                <option value="">Select your club</option>
                {userClubs.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
              </select>
              {formErrors.clubId && <span className="error-text">{formErrors.clubId}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select id="category" name="category" value={formData.category}
                onChange={handleChange} className={formErrors.category ? 'input-error' : ''}>
                <option value="">Select category</option>
                {EVENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {formErrors.category && <span className="error-text">{formErrors.category}</span>}
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">Event Title *</label>
            <input type="text" id="title" name="title" value={formData.title}
              onChange={handleChange} placeholder="e.g., Annual Tech Summit 2025"
              className={formErrors.title ? 'input-error' : ''} />
            {formErrors.title && <span className="error-text">{formErrors.title}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea id="description" name="description" value={formData.description}
              onChange={handleChange} rows={6} placeholder="What's happening at this event?"
              className={formErrors.description ? 'input-error' : ''} />
            {formErrors.description && <span className="error-text">{formErrors.description}</span>}
          </div>

          {/* Row 2: Date + Location */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date & Time *</label>
              <input type="datetime-local" id="date" name="date" value={formData.date}
                onChange={handleChange} className={formErrors.date ? 'input-error' : ''} />
              {formErrors.date && <span className="error-text">{formErrors.date}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input type="text" id="location" name="location" value={formData.location}
                onChange={handleChange} placeholder="Full venue address"
                className={formErrors.location ? 'input-error' : ''} />
              {formErrors.location && <span className="error-text">{formErrors.location}</span>}
            </div>
          </div>

          {/* Image URL */}
          <div className="form-group">
            <label htmlFor="imageUrl">Banner Image URL</label>
            <input type="url" id="imageUrl" name="imageUrl" value={formData.imageUrl}
              onChange={handleChange} placeholder="https://images.unsplash.com/..." />
          </div>

          {/* Actions */}
          <div className="form-actions">
            <Button type="button" variant="outline" onClick={() => navigate('/manage-clubs')}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={loading || success}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditEventPage;
