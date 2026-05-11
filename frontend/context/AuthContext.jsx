'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('attyer_user');
    window.location.href = '/';
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('attyer_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);

    // Only add interceptor if user is logged in
    if (!storedUser) return;

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        // Don't retry refresh requests themselves
        if (originalRequest.url?.includes('/auth/refresh')) {
          logout();
          return Promise.reject(error);
        }
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const res = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
            if (res.data.success && res.data.accessToken) {
              const u = JSON.parse(localStorage.getItem('attyer_user'));
              if (u) {
                const updatedUser = { ...u, token: res.data.accessToken };
                localStorage.setItem('attyer_user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
                return axios(originalRequest);
              }
            }
          } catch (refreshError) {
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password }, { withCredentials: true });
    const userData = { ...response.data.user, token: response.data.accessToken };
    setUser(userData);
    localStorage.setItem('attyer_user', JSON.stringify(userData));
    return response.data;
  };

  const register = async (name, email, password, phone) => {
    const response = await axios.post(`${API_URL}/auth/register`, { name, email, password, phone }, { withCredentials: true });
    const userData = { ...response.data.user, token: response.data.accessToken };
    setUser(userData);
    localStorage.setItem('attyer_user', JSON.stringify(userData));
    return response.data;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);