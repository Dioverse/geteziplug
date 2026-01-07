import axios from "axios";

// const API_BASE = import.meta.env.VITE_BACKEND_API_BASE || 'http://localhost:8006';

const apiService = axios.create({
  baseURL: '/api/admin',
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add interceptors for token injection
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiService;