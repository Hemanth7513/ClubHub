import React, { useState, useEffect } from 'react';
import { Star, Trash2, Send } from 'lucide-react';
import Button from '../Button/Button';
import API_BASE_URL from '../../config';
import { useAuth } from '../../context/AuthContext';
import './ReviewsSection.css';

const ReviewsSection = ({ clubId }) => {
  const { user, token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [clubId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/reviews/club/${clubId}`);
      if (!res.ok) throw new Error('Failed to load reviews');
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setSubmitError('Please log in to submit a review.');
      return;
    }
    
    try {
      setSubmitting(true);
      setSubmitError(null);
      const res = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ club_id: clubId, rating, comment })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');
      
      setReviews([data, ...reviews]);
      setComment('');
      setRating(5);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to delete review');
      setReviews(reviews.filter(r => r.id !== reviewId));
    } catch (err) {
      alert(err.message);
    }
  };

  const hasReviewed = user && reviews.some(r => r.user_id === user.id);

  if (loading) return <div className="reviews-loading">Loading reviews...</div>;

  return (
    <div className="reviews-section">
      <h3>Reviews & Ratings ({reviews.length})</h3>
      
      {error && <div className="reviews-error">{error}</div>}

      {/* Write a Review */}
      {user && !hasReviewed && (
        <form className="review-form glass-panel" onSubmit={handleSubmit}>
          <h4>Write a Review</h4>
          {submitError && <div className="review-error-msg">{submitError}</div>}
          
          <div className="rating-selector">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={24}
                className={star <= rating ? 'star-filled' : 'star-empty'}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          
          <textarea
            placeholder="Share your experience with this club..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            rows={3}
          />
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Submitting...' : <><Send size={16} style={{marginRight: '8px'}} /> Submit</>}
          </Button>
        </form>
      )}

      {user && hasReviewed && (
        <div className="reviewed-msg">You have already reviewed this club. Thank you!</div>
      )}

      {!user && (
        <div className="login-prompt">
          Please log in to leave a review.
        </div>
      )}

      {/* Review List */}
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <p className="no-reviews">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    {review.users?.profiles?.avatar_url ? (
                      <img src={review.users.profiles.avatar_url} alt={review.users.name} />
                    ) : (
                      <span className="avatar-placeholder">{review.users?.name?.charAt(0) || '?'}</span>
                    )}
                  </div>
                  <div>
                    <span className="reviewer-name">{review.users?.name || 'Anonymous User'}</span>
                    <span className="review-date">
                      {new Date(review.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                {user && user.id === review.user_id && (
                  <button className="delete-review-btn" onClick={() => handleDelete(review.id)} title="Delete Review">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              
              <div className="review-rating">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} size={14} className={star <= review.rating ? 'star-filled' : 'star-empty'} />
                ))}
              </div>
              
              <p className="review-comment">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;
