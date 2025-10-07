import axios from "axios";

// const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8006';
const API_BASE = import.meta.env.VITE_BACKEND_API_BASE//'https://cashpoint.deovaze.com';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, err => Promise.reject(err));


// Simple 401 handler (tries refresh if you implement it; otherwise redirects)
api.interceptors.response.use(
  res => res,
  async err => {
    const { response } = err;
    if (response && response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

export default api;
