import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('attyer_user');
    if (userData) {
      const parsed = JSON.parse(userData);
      if (parsed?.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/refresh`, {}, { withCredentials: true });
        if (res.data.success && res.data.accessToken) {
          if (typeof window !== 'undefined') {
            const u = JSON.parse(localStorage.getItem('attyer_user'));
            if (u) {
              const updatedUser = { ...u, token: res.data.accessToken };
              localStorage.setItem('attyer_user', JSON.stringify(updatedUser));
              originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
              return api(originalRequest);
            }
          }
        }
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('attyer_user');
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
