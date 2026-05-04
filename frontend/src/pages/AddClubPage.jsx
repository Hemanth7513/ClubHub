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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const categories = [
    'Social & Recreation Clubs',
    'Service Clubs',
    'NGOs & Social Organizations',
    'Sports & Activity Clubs',
    'Cultural & Literary Clubs',
    'Professional & Networking',
    'Student & Tech Groups',
    'Nightlife & Entertainment'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        throw new Error('Failed to create club. Please try again.');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error("Error creating club:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
        <form onSubmit={handleSubmit} className="club-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Community Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., GDG Vijayawada"
              />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
              >
                <option value="" disabled>Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              placeholder="What is your community about? What do you do?"
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Benz Circle, Vijayawada"
              />
            </div>
            <div className="form-group">
              <label htmlFor="contactInfo">Contact Info</label>
              <input
                type="text"
                id="contactInfo"
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleChange}
                placeholder="Email, Phone, or Website link"
              />
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
