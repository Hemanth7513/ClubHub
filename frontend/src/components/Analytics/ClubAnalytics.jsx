import React, { useState, useEffect } from 'react';
import { Activity, Users, Calendar, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../config';

const ClubAnalytics = ({ clubs }) => {
  const { token } = useAuth();
  const [selectedClubId, setSelectedClubId] = useState(clubs.length > 0 ? clubs[0].id : '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedClubId) return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE_URL}/analytics/club/${selectedClubId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load analytics');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedClubId, token]);

  if (clubs.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
        <Activity size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
        <h3>No Clubs Yet</h3>
        <p>Create a club to start seeing analytics!</p>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Dashboard Analytics</h2>
        <select 
          className="auth-input" 
          style={{ width: 'auto', marginBottom: 0 }}
          value={selectedClubId} 
          onChange={(e) => setSelectedClubId(e.target.value)}
        >
          {clubs.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading && <p>Loading stats...</p>}
      {error && <p className="error-text">{error}</p>}
      
      {data && !loading && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-cyan)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, color: 'var(--text-muted)' }}>Followers</h4>
                <Users size={20} color="var(--accent-cyan)" />
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{data.totalFollowers}</p>
            </div>
            
            <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-pink)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, color: 'var(--text-muted)' }}>Events Hosted</h4>
                <Calendar size={20} color="var(--accent-pink)" />
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{data.totalEvents}</p>
            </div>
            
            <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-yellow)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, color: 'var(--text-muted)' }}>Total Profile Views</h4>
                <TrendingUp size={20} color="var(--accent-yellow)" />
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                {data.views.reduce((acc, curr) => acc + curr.page_views, 0)}
              </p>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Profile Views (Last 30 Days)</h3>
            
            {data.views.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No views recorded yet in the past 30 days.</p>
            ) : (
              <div style={{ display: 'flex', gap: '8px', height: '150px', alignItems: 'flex-end', paddingTop: '1rem' }}>
                {data.views.map((day, idx) => {
                  const maxViews = Math.max(...data.views.map(v => v.page_views), 1);
                  const heightPercentage = (day.page_views / maxViews) * 100;
                  return (
                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                      <div 
                        style={{ 
                          width: '100%', 
                          height: `${Math.max(heightPercentage, 5)}%`, 
                          background: 'var(--accent-cyan)', 
                          borderRadius: '4px 4px 0 0',
                          minHeight: '4px',
                          position: 'relative'
                        }} 
                        title={`${day.view_date}: ${day.page_views} views`}
                      >
                         <span style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.7rem', color: 'var(--text-muted)'}}>
                           {day.page_views > 0 ? day.page_views : ''}
                         </span>
                      </div>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-light)', transform: 'rotate(-45deg)', transformOrigin: 'top left', marginTop: '10px' }}>
                        {new Date(day.view_date).getDate()}/{new Date(day.view_date).getMonth() + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{ height: '30px' }}></div>
          </div>
        </>
      )}
    </div>
  );
};

export default ClubAnalytics;
