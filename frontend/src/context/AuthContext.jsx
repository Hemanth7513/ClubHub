import React, { createContext, useState, useContext, useEffect } from 'react';
import API_BASE_URL from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('clubhub_token'));
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (authToken) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setProfile(data.profile);
        localStorage.setItem('clubhub_user', JSON.stringify(data.user));
      } else if (res.status === 401 || res.status === 403) {
        logout();
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = localStorage.getItem('clubhub_user');
      const savedToken = localStorage.getItem('clubhub_token');
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
        
        try {
          const res = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${savedToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            setProfile(data.profile);
            localStorage.setItem('clubhub_user', JSON.stringify(data.user));
          } else if (res.status === 401 || res.status === 403) {
            logout();
          }
        } catch (err) {
          console.error("Failed to verify token on startup:", err);
          // Keep offline session if server is unreachable
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('clubhub_user', JSON.stringify(userData));
    localStorage.setItem('clubhub_token', userToken);
    fetchProfile(userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setProfile(null);
    localStorage.removeItem('clubhub_user');
    localStorage.removeItem('clubhub_token');
  };

  const updateProfileState = (updatedUser, updatedProfile) => {
    if (updatedUser) {
      setUser(updatedUser);
      localStorage.setItem('clubhub_user', JSON.stringify(updatedUser));
    }
    if (updatedProfile) {
      setProfile(updatedProfile);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, profile, login, logout, loading, updateProfileState, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
