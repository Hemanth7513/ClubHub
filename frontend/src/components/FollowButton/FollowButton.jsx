import React, { useState, useEffect } from 'react';
import { UserPlus, Check } from 'lucide-react';
import Button from '../Button/Button';
import API_BASE_URL from '../../config';
import { useAuth } from '../../context/AuthContext';
import './FollowButton.css';

const FollowButton = ({ clubId }) => {
  const { user, token } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && token) {
      checkFollowStatus();
    } else {
      setLoading(false);
    }
  }, [clubId, user, token]);

  const checkFollowStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/follows/check/${clubId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.isFollowing);
      }
    } catch (err) {
      console.error('Error checking follow status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!user) {
      alert("Please log in to follow clubs.");
      return;
    }
    
    setLoading(true);
    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const res = await fetch(`${API_BASE_URL}/follows/${clubId}`, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setIsFollowing(!isFollowing);
      } else {
        throw new Error('Failed to toggle follow status');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isFollowing) {
    return <Button variant="outline" size="small" disabled>Loading...</Button>;
  }

  return (
    <Button 
      variant={isFollowing ? 'outline' : 'primary'} 
      size="small" 
      onClick={handleToggleFollow}
      className={`follow-btn ${isFollowing ? 'following' : ''}`}
      disabled={loading}
    >
      {isFollowing ? (
        <><Check size={16} style={{marginRight: 6}} /> Following</>
      ) : (
        <><UserPlus size={16} style={{marginRight: 6}} /> Follow</>
      )}
    </Button>
  );
};

export default FollowButton;
