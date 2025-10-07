// src/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../src/services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  useEffect(() => {
    const init = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      // ensure axios default header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      try {
        const { data } = await api.get('/user');
        setUser(data);
      } catch (e) {
        console.error('Fetch user failed', e);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [token]);

  const login = async (email, password) => {

    const res = await api.post('/admin/login', { email, password });
    const tokenFromServer = res.data.results.token || res.data.results.token || res.data.data?.token;
    if (!tokenFromServer) throw new Error('No token in login response');
    localStorage.setItem('token', tokenFromServer);
    setToken(tokenFromServer);
    api.defaults.headers.common['Authorization'] = `Bearer ${tokenFromServer}`;

    const me = res.data.results; //await api.get('/user');
    setUser(me.user);
  };

  const logout = async () => {
    // eslint-disable-next-line no-unused-vars
    try { await api.post('/logout'); } catch(e){ /* ignore network errors */ }
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
