import React, { useState, useEffect } from 'react';
import { Shield, UserPlus, Trash2, ShieldAlert } from 'lucide-react';
import Button from '../Button/Button';
import API_BASE_URL from '../../config';

const TeamManager = ({ clubs, token }) => {
  const [selectedClubId, setSelectedClubId] = useState(clubs[0]?.id || '');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState(null);

  useEffect(() => {
    if (selectedClubId) {
      fetchMembers();
    }
  }, [selectedClubId]);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/members/club/${selectedClubId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load club members');
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviteLoading(true);
    setInviteError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/members/club/${selectedClubId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add member');
      
      setMembers([...members, data]);
      setInviteEmail('');
    } catch (err) {
      setInviteError(err.message);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleUpdateRole = async (memberId, currentRole) => {
    const newRole = currentRole === 'editor' ? 'moderator' : 'editor';
    try {
      const res = await fetch(`${API_BASE_URL}/members/${memberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      
      if (!res.ok) throw new Error('Failed to update role');
      const updated = await res.json();
      setMembers(members.map(m => m.id === memberId ? updated : m));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/members/${memberId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to remove member');
      setMembers(members.filter(m => m.id !== memberId));
    } catch (err) {
      alert(err.message);
    }
  };

  if (clubs.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <ShieldAlert size={48} style={{ color: 'var(--accent-pink)', marginBottom: '1rem' }} />
        <h3>No Owned Clubs</h3>
        <p>You must be a club owner to manage team roles.</p>
      </div>
    );
  }

  return (
    <div className="team-manager-section">
      <div className="section-header" style={{ marginBottom: '1.5rem' }}>
        <h2>Manage Club Team</h2>
        <select 
          className="brutalist-input" 
          value={selectedClubId} 
          onChange={(e) => setSelectedClubId(e.target.value)}
          style={{ width: 'auto', minWidth: '200px', padding: '8px 12px' }}
        >
          {clubs.map(club => (
            <option key={club.id} value={club.id}>{club.name}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {/* Add Member Form */}
        <form className="glass-panel" onSubmit={handleAddMember} style={{ padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Add Team Member</h3>
          {inviteError && <div style={{ color: 'var(--accent-pink)', marginBottom: '1rem' }}>{inviteError}</div>}
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <input
              type="email"
              placeholder="User Email Address"
              className="brutalist-input"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              style={{ flex: 1, minWidth: '200px' }}
            />
            <select
              className="brutalist-input"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              style={{ minWidth: '150px' }}
            >
              <option value="editor">Editor</option>
              <option value="moderator">Moderator</option>
            </select>
            <Button type="submit" disabled={inviteLoading}>
              <UserPlus size={16} style={{ marginRight: 8 }} /> Add
            </Button>
          </div>
        </form>

        {/* Members List */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Team Members</h3>
          
          {loading ? (
            <p>Loading members...</p>
          ) : error ? (
            <p style={{ color: 'var(--accent-pink)' }}>{error}</p>
          ) : members.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No members added yet. Add editors or moderators to help manage this club.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {members.map(member => (
                <div key={member.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {member.users?.profiles?.avatar_url ? (
                        <img src={member.users.profiles.avatar_url} alt={member.users.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontWeight: 'bold' }}>{member.users?.name?.charAt(0) || '?'}</span>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{member.users?.name || 'Anonymous User'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{member.users?.email}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button 
                      onClick={() => handleUpdateRole(member.id, member.role)}
                      className="brutalist-button"
                      style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                      title="Click to toggle role"
                    >
                      <Shield size={14} /> {member.role.toUpperCase()}
                    </button>
                    <Button 
                      size="small" 
                      onClick={() => handleRemoveMember(member.id)}
                      style={{ borderColor: 'var(--accent-pink)', color: 'var(--accent-pink)', padding: '6px 10px' }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamManager;
