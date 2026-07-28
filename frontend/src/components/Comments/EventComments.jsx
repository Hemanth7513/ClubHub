import React, { useState, useEffect } from 'react';
import { Send, Trash2, Edit2, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../Button/Button';
import API_BASE_URL from '../../config';

const EventComments = ({ eventId }) => {
  const { user, token } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/comments/event/${eventId}`);
      if (!res.ok) throw new Error('Failed to load comments');
      const data = await res.json();
      setComments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) fetchComments();
  }, [eventId]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    if (!user) {
      alert("Please login to comment");
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/comments/event/${eventId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newComment })
      });
      if (!res.ok) throw new Error('Failed to post comment');
      const createdComment = await res.json();
      setComments([...comments, createdComment]);
      setNewComment('');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (id) => {
    if (!editContent.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/comments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: editContent })
      });
      if (!res.ok) throw new Error('Failed to update comment');
      const updatedComment = await res.json();
      setComments(comments.map(c => c.id === id ? updatedComment : c));
      setEditingId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/comments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete comment');
      setComments(comments.filter(c => c.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div>Loading discussion...</div>;
  if (error) return <div className="error-text">Error: {error}</div>;

  return (
    <div className="comments-section">
      <h3><MessageSquare size={20} /> Discussion ({comments.length})</h3>
      
      {user ? (
        <div className="comment-input-area">
          <textarea 
            className="comment-textarea"
            placeholder="Ask a question or discuss this event..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            maxLength={1000}
          />
          <div className="comment-submit-row">
            <Button variant="primary" onClick={handleSubmit} disabled={submitting || !newComment.trim()}>
              <Send size={16} style={{marginRight: '8px'}} />
              {submitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ padding: '1rem', background: 'var(--bg-main)', border: '2px dashed var(--border-dark)', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
          <p>Login to join the discussion.</p>
        </div>
      )}

      <div className="comments-list">
        {comments.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No comments yet. Be the first to start the discussion!</p>
        ) : (
          comments.map(comment => {
            const isOwner = user && (user.id === comment.users.id || user.role === 'admin');
            const isEditing = editingId === comment.id;
            
            return (
              <div key={comment.id} className="comment-item">
                <div className="comment-avatar">
                  {comment.users.name.charAt(0).toUpperCase()}
                </div>
                <div className="comment-body">
                  <div className="comment-header">
                    <span className="comment-author">{comment.users.name}</span>
                    <span className="comment-date">
                      {new Date(comment.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  {isEditing ? (
                    <div>
                      <textarea 
                        className="comment-textarea" 
                        style={{ minHeight: '60px', marginBottom: '0.5rem' }}
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                      />
                      <div className="comment-actions">
                        <button className="comment-action-btn" onClick={() => setEditingId(null)}>Cancel</button>
                        <Button size="small" variant="primary" onClick={() => handleEdit(comment.id)}>Save</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="comment-text">{comment.content}</p>
                      {isOwner && (
                        <div className="comment-actions">
                          <button className="comment-action-btn" onClick={() => {
                            setEditingId(comment.id);
                            setEditContent(comment.content);
                          }}>
                            <Edit2 size={14} /> Edit
                          </button>
                          <button className="comment-action-btn delete" onClick={() => handleDelete(comment.id)}>
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EventComments;
