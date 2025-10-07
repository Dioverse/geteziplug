import axios from "axios";

const API_BASE = import.meta.env.VITE_BACKEND_API_BASE || 'http://localhost:8006';


const apiService = axios.create({
  baseURL: `${API_BASE}/api/admin`,
  headers: {
    "Content-Type": "application/json",
  }
});

// Always attach latest token before each request
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global 401 handling
apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

// get request api ..............................................
const getRequest = (url, config) => apiService.get(url, config);

// post request api ..............................................
const postRequest = (url, data, config) => apiService.post(url, data, config);

// put request api ..............................................
const putRequest = (url, data, config) => apiService.put(url, data, config);

// delete request api ..............................................
const deleteRequest = (url, config) => apiService.delete(url, config);

// patch request api ..............................................
const patchRequest = (url, data, config) => apiService.patch(url, data, config);

export { API_BASE, apiService, getRequest, postRequest, putRequest, deleteRequest, patchRequest };