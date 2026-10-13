import axios from 'axios';

const rawUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').trim().replace(/\/+$/, '');
const baseURL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;

const api = axios.create({
  baseURL,
});

// attach JWT to every request
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// expired / invalid token -> back to login
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const errMsg = (e) => e.response?.data?.message || e.message || 'Something went wrong';
export const money = (n) => `₹${Number(n).toFixed(2)}`;

export default api;
