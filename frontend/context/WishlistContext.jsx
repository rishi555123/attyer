'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const userData = localStorage.getItem('attyer_user');
      const token = userData ? JSON.parse(userData).token : null;
      if (!token) return;
      axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/wishlist`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setWishlist(res.data.data.products.map(p => p._id || p)))
        .catch(err => console.error(err));
    } else {
      const saved = localStorage.getItem('attyer_wishlist');
      if (saved) setWishlist(JSON.parse(saved));
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('attyer_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, user]);

  const toggleWishlist = async (productId) => {
    setWishlist(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
    if (user) {
      try {
        const userData = localStorage.getItem('attyer_user');
        const token = userData ? JSON.parse(userData).token : null;
        if (!token) return;
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/wishlist/${productId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      } catch (err) {
        console.error('Failed to update wishlist', err);
      }
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
