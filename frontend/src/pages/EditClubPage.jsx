import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button/Button';
import API_BASE_URL from '../config';
import './AddClubPage.css';
import './EditClubPage.css';

const CATEGORIES = [
  'Social & Recreation Clubs',
  'Service Clubs',
  'NGOs & Social Organizations',
  'Sports & Activity Clubs',
  'Cultural & Literary Clubs',
  'Professional & Networking',
  'Student & Tech Groups',
  'Nightlife & Entertainment'
];

const EditClubPage = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', category: '', description: '',
    location: '', contactInfo: '', imageUrl: '',
    establishedYear: '', googleMapsUrl: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!user) { navigate('/login'); return; }

    const fetchClub = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/clubs/${id}`);
        if (!res.ok) throw new Error('Club not found');
        const club = await res.json();

        // Check ownership
        if (club.userId && club.userId !== user.id) {
          setUnauthorized(true);
          return;
        }

        setFormData({
          name: club.name || '',
          category: club.category || '',
          description: club.description || '',
          location: club.location || '',
          contactInfo: club.contactInfo || '',
          imageUrl: club.imageUrl || '',
          establishedYear: club.establishedYear || '',
          googleMapsUrl: club.googleMapsUrl || ''
        });
      } catch (err) {
        setError('Failed to load club details.');
      } finally {
        setFetching(false);
      }
    };

    fetchClub();
  }, [id, user, navigate]);

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Community name is required';
    if (!formData.category) errors.category = 'Please select a category';
    if (formData.description.trim().length < 50) errors.description = 'Description must be at least 50 characters';
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (!formData.contactInfo.trim()) errors.contactInfo = 'Contact info is required';
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
      const res = await fetch(`${API_BASE_URL}/clubs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update club');
      }
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1800);
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
        <p>Loading club details...</p>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="container edit-club-page">
        <div className="edit-unauthorized glass-panel">
          <AlertCircle size={48} />
          <h2>Access Denied</h2>
          <p>You can only edit clubs you have created.</p>
          <Button variant="primary" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
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
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
        <h1 className="text-gradient">Edit Community</h1>
        <p>Update your club's details. Changes go live immediately.</p>
      </motion.div>

      {success && (
        <motion.div className="success-message" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <CheckCircle size={20} style={{ display: 'inline', marginRight: 8 }} />
          Club updated successfully! Redirecting to dashboard...
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
        {/* Image Preview */}
        {formData.imageUrl && (
          <div className="image-preview-wrap">
            <img src={formData.imageUrl} alt="Club cover preview" className="image-preview" onError={e => e.target.style.display = 'none'} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="club-form" noValidate>
          {/* Row 1: Name + Category */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Community Name *</label>
              <input type="text" id="name" name="name" value={formData.name}
                onChange={handleChange} placeholder="e.g., GDG Vijayawada"
                className={formErrors.name ? 'input-error' : ''} />
              {formErrors.name && <span className="error-text">{formErrors.name}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select id="category" name="category" value={formData.category}
                onChange={handleChange} className={formErrors.category ? 'input-error' : ''}>
                <option value="" disabled>Select a category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {formErrors.category && <span className="error-text">{formErrors.category}</span>}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea id="description" name="description" value={formData.description}
              onChange={handleChange} rows={7}
              placeholder="What is your community about? What do you do? (Min 50 characters)"
              className={formErrors.description ? 'input-error' : ''} />
            {formErrors.description && <span className="error-text">{formErrors.description}</span>}
          </div>

          {/* Row 2: Location + Contact */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input type="text" id="location" name="location" value={formData.location}
                onChange={handleChange} placeholder="e.g., Benz Circle, Vijayawada"
                className={formErrors.location ? 'input-error' : ''} />
              {formErrors.location && <span className="error-text">{formErrors.location}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="contactInfo">Contact Info *</label>
              <input type="text" id="contactInfo" name="contactInfo" value={formData.contactInfo}
                onChange={handleChange} placeholder="Email, Phone, or Website"
                className={formErrors.contactInfo ? 'input-error' : ''} />
              {formErrors.contactInfo && <span className="error-text">{formErrors.contactInfo}</span>}
            </div>
          </div>

          {/* Row 3: Image URL + Year */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="imageUrl">Cover Image URL</label>
              <input type="url" id="imageUrl" name="imageUrl" value={formData.imageUrl}
                onChange={handleChange} placeholder="https://images.unsplash.com/..." />
            </div>
            <div className="form-group">
              <label htmlFor="establishedYear">Established Year</label>
              <input type="number" id="establishedYear" name="establishedYear" value={formData.establishedYear}
                onChange={handleChange} placeholder="e.g. 2015"
                min="1800" max={new Date().getFullYear()} />
            </div>
          </div>

          {/* Google Maps URL */}
          <div className="form-group">
            <label htmlFor="googleMapsUrl">Google Maps URL</label>
            <input type="url" id="googleMapsUrl" name="googleMapsUrl" value={formData.googleMapsUrl}
              onChange={handleChange} placeholder="https://maps.google.com/..." />
          </div>

          {/* Actions */}
          <div className="form-actions">
            <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={loading || success}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditClubPage;
