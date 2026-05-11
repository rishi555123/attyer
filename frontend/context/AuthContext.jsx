'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setCookies = (token, role) => {
    document.cookie = `attyer_token=${token}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `attyer_role=${role}; path=/; max-age=604800; SameSite=Lax`;
  };

  const clearCookies = () => {
    document.cookie = `attyer_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `attyer_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('attyer_user');
    clearCookies();
    window.location.href = '/';
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('attyer_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setCookies(parsedUser.token, parsedUser.role);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const userData = { ...response.data.user, token: response.data.accessToken };
    setUser(userData);
    localStorage.setItem('attyer_user', JSON.stringify(userData));
    setCookies(userData.token, userData.role);
    return response.data;
  };

  const register = async (name, email, password, phone) => {
    const response = await api.post('/auth/register', { name, email, password, phone });
    const userData = { ...response.data.user, token: response.data.accessToken };
    setUser(userData);
    localStorage.setItem('attyer_user', JSON.stringify(userData));
    setCookies(userData.token, userData.role);
    return response.data;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);