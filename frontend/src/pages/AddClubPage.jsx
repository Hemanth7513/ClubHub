import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button/Button';
import API_BASE_URL from '../config';
import './AddClubPage.css';

const AddClubPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    location: '',
    contactInfo: '',
    imageUrl: '',
    establishedYear: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    let errors = {};
    if (!formData.name.trim()) errors.name = "Community name is required";
    if (!formData.category) errors.category = "Please select a category";
    if (formData.description.length < 50) errors.description = "Description should be at least 50 characters";
    if (!formData.location.trim()) errors.location = "Location is required";
    if (!formData.contactInfo.trim()) errors.contactInfo = "Contact info is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/clubs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create club. Please check your credentials.');
      }

      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const categoriesList = [
    'Social & Recreation Clubs',
    'Service Clubs',
    'NGOs & Social Organizations',
    'Sports & Activity Clubs',
    'Cultural & Literary Clubs',
    'Professional & Networking',
    'Student & Tech Groups',
    'Nightlife & Entertainment'
  ];

  return (
    <div className="container add-club-page">
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <h1 className="text-gradient">Add a Community</h1>
        <p>Help others discover your Vijayawada-based club or organization.</p>
      </motion.div>

      {success && (
        <motion.div 
          className="success-message"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          Community created successfully! Redirecting to directory...
        </motion.div>
      )}

      {error && (
        <motion.div 
          className="error-message"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {error}
        </motion.div>
      )}

      <motion.div 
        className="form-container"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <form onSubmit={handleSubmit} className="club-form" noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Community Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., GDG Vijayawada"
                className={formErrors.name ? 'input-error' : ''}
              />
              {formErrors.name && <span className="error-text">{formErrors.name}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={formErrors.category ? 'input-error' : ''}
              >
                <option value="" disabled>Select a category</option>
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {formErrors.category && <span className="error-text">{formErrors.category}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What is your community about? What do you do?"
              className={formErrors.description ? 'input-error' : ''}
            ></textarea>
            {formErrors.description && <span className="error-text">{formErrors.description}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Benz Circle, Vijayawada"
                className={formErrors.location ? 'input-error' : ''}
              />
              {formErrors.location && <span className="error-text">{formErrors.location}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="contactInfo">Contact Info *</label>
              <input
                type="text"
                id="contactInfo"
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleChange}
                placeholder="Email, Phone, or Website link"
                className={formErrors.contactInfo ? 'input-error' : ''}
              />
              {formErrors.contactInfo && <span className="error-text">{formErrors.contactInfo}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="imageUrl">Cover Image URL</label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="form-group">
              <label htmlFor="establishedYear">Established Year</label>
              <input
                type="number"
                id="establishedYear"
                name="establishedYear"
                value={formData.establishedYear}
                onChange={handleChange}
                placeholder="e.g. 2021"
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>
          </div>

          <div className="form-actions">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading || success}
            >
              {loading ? 'Creating...' : 'Create Community'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddClubPage;
