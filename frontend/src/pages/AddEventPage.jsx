import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button/Button';
import API_BASE_URL from '../config';
import './AddClubPage.css'; // Reuse form styles

const AddEventPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [formData, setFormData] = useState({
    clubId: '',
    title: '',
    description: '',
    date: '',
    location: '',
    imageUrl: '',
    category: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!user) navigate('/login');
    fetchUserClubs();
  }, [user, navigate]);

  const fetchUserClubs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/clubs`);
      const data = await res.json();
      setClubs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to create event');
      navigate('/events');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container add-club-page">
      <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-gradient">Post an Event</h1>
        <p>Bring the community together with a new event.</p>
      </motion.div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="club-form">
          <div className="form-group">
            <label>Select Your Club *</label>
            <select name="clubId" required value={formData.clubId} onChange={handleChange}>
              <option value="">Select a club</option>
              {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Event Title *</label>
            <input type="text" name="title" required value={formData.title} onChange={handleChange} placeholder="e.g. Monthly Meetup" />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea name="description" required value={formData.description} onChange={handleChange} placeholder="What's happening?" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date & Time *</label>
              <input type="datetime-local" name="date" required value={formData.date} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select name="category" required value={formData.category} onChange={handleChange}>
                <option value="">Select category</option>
                <option value="Gala">Gala</option>
                <option value="Workshop">Workshop</option>
                <option value="Sports">Sports</option>
                <option value="Nightlife">Nightlife</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Location *</label>
            <input type="text" name="location" required value={formData.location} onChange={handleChange} placeholder="Full address" />
          </div>

          <div className="form-group">
            <label>Cover Image URL</label>
            <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://..." />
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="form-actions">
            <Button type="button" variant="outline" onClick={() => navigate('/events')}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Posting...' : 'Post Event'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventPage;
