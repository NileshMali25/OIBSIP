import axios from 'axios';
import { store } from '../redux/store';
import { logout } from '../redux/authSlice';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Do not intercept login requests (incorrect credentials should just show error)
      if (error.config && error.config.url && error.config.url.includes('/auth/login')) {
        return Promise.reject(error);
      }

      const state = store.getState();
      const isAdmin = state.auth.user?.role === 'Admin';
      
      // Clear token and auth info from Redux
      store.dispatch(logout());
      
      // Redirect to appropriate login page
      if (isAdmin || window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
