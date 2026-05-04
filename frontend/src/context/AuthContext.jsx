import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('clubhub_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('clubhub_user');
    const savedToken = localStorage.getItem('clubhub_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('clubhub_user', JSON.stringify(userData));
    localStorage.setItem('clubhub_token', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('clubhub_user');
    localStorage.removeItem('clubhub_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
