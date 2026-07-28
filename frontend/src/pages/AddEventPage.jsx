import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, TicketIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button/Button';
import RichTextEditor from '../components/RichTextEditor/RichTextEditor';
import API_BASE_URL from '../config';
import './AddClubPage.css';
import './AddEventPage.css';

const EVENT_CATEGORIES = ['Gala', 'Workshop', 'Sports', 'Nightlife', 'Meetup', 'Conference', 'Exhibition', 'Fundraiser'];

const AddEventPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [userClubs, setUserClubs] = useState([]);
  const [formData, setFormData] = useState({
    clubId: '', title: '', description: '',
    date: '', location: '', imageUrl: '', category: ''
  });
  const [ticket, setTicket] = useState({ name: 'General Admission', price_inr: '0', capacity: '100' });
  const [showTicket, setShowTicket] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!user) { navigate('/login'); return; }

    // Load only the logged-in user's own clubs
    const fetchUserClubs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/clubs`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setUserClubs(await res.json());
      } catch (err) {
        console.error('Failed to load clubs', err);
      }
    };
    fetchUserClubs();
  }, [user, token, navigate]);

  const validate = () => {
    const errors = {};
    if (!formData.clubId) errors.clubId = 'Please select your club';
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

  const handleTicketChange = (e) => {
    const { name, value } = e.target;
    setTicket(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Create the event
      const res = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create event');
      }
      const event = await res.json();

      // 2. If ticket setup is enabled, create the ticket tier
      if (showTicket && ticket.name.trim()) {
        const ticketRes = await fetch(`${API_BASE_URL}/events/${event.id}/tickets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            name: ticket.name,
            price_inr: parseFloat(ticket.price_inr) || 0,
            capacity: parseInt(ticket.capacity) || 100
          })
        });
        if (!ticketRes.ok) {
          const ticketData = await ticketRes.json().catch(() => ({}));
          // Event was created — warn but don't block
          console.warn('Ticket creation failed:', ticketData.error);
        }
      }

      setSuccess(true);
      setTimeout(() => navigate('/manage-clubs'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container add-club-page">
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <h1 className="text-gradient">Post an Event</h1>
        <p>Bring the Vijayawada community together with a new event.</p>
      </motion.div>

      {success && (
        <motion.div className="success-message" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <CheckCircle size={20} style={{ display: 'inline', marginRight: 8 }} />
          Event created! Redirecting to your dashboard...
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
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Banner Preview */}
        {formData.imageUrl && (
          <div className="image-preview-wrap">
            <img src={formData.imageUrl} alt="Banner preview" className="image-preview"
              onError={e => e.target.style.display = 'none'} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="club-form" noValidate>

          {/* Row 1: Club + Category */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="clubId">Your Club *</label>
              {userClubs.length === 0 ? (
                <div className="no-clubs-hint">
                  <AlertCircle size={15} />
                  You haven't created any clubs yet.{' '}
                  <button type="button" className="text-link-inline" onClick={() => navigate('/add-club')}>
                    Create one first →
                  </button>
                </div>
              ) : (
                <select id="clubId" name="clubId" value={formData.clubId}
                  onChange={handleChange} className={formErrors.clubId ? 'input-error' : ''}>
                  <option value="">Select your club</option>
                  {userClubs.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                </select>
              )}
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
            <RichTextEditor
              value={formData.description}
              onChange={(val) => {
                setFormData(prev => ({ ...prev, description: val }));
                if (formErrors.description) setFormErrors(prev => ({ ...prev, description: null }));
              }}
              placeholder="What's happening at this event? Who should attend?"
              minHeight={160}
            />
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
              <label htmlFor="location">Venue / Location *</label>
              <input type="text" id="location" name="location" value={formData.location}
                onChange={handleChange} placeholder="e.g., Siddhartha Hotel, Vijayawada"
                className={formErrors.location ? 'input-error' : ''} />
              {formErrors.location && <span className="error-text">{formErrors.location}</span>}
            </div>
          </div>

          {/* Banner URL */}
          <div className="form-group">
            <label htmlFor="imageUrl">Banner Image URL <span className="label-hint">(optional)</span></label>
            <input type="url" id="imageUrl" name="imageUrl" value={formData.imageUrl}
              onChange={handleChange} placeholder="https://images.unsplash.com/..." />
          </div>

          {/* ── Ticket Setup (collapsible) ─────────────── */}
          <div className="ticket-setup-card">
            <button type="button" className="ticket-toggle" onClick={() => setShowTicket(v => !v)}>
              <TicketIcon size={18} />
              <span>Ticket Setup</span>
              <span className="ticket-toggle-hint">
                {showTicket ? 'Collapse' : 'Add ticket tiers for this event'}
              </span>
              {showTicket ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showTicket && (
              <motion.div
                className="ticket-setup-fields"
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.25 }}
              >
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="ticketName">Ticket Name</label>
                    <input type="text" id="ticketName" name="name" value={ticket.name}
                      onChange={handleTicketChange} placeholder="e.g., General Admission" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ticketPrice">
                      Price (₹)
                      {parseFloat(ticket.price_inr) === 0 && (
                        <span className="free-badge">FREE</span>
                      )}
                    </label>
                    <input type="number" id="ticketPrice" name="price_inr" value={ticket.price_inr}
                      onChange={handleTicketChange} placeholder="0 for free"
                      min="0" step="0.01" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ticketCapacity">Capacity</label>
                    <input type="number" id="ticketCapacity" name="capacity" value={ticket.capacity}
                      onChange={handleTicketChange} placeholder="100"
                      min="1" max="10000" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Actions */}
          <div className="form-actions">
            <Button type="button" variant="outline" onClick={() => navigate('/manage-clubs')}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={loading || success}>
              {loading ? 'Posting...' : 'Post Event'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddEventPage;
