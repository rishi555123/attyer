'use client';
import { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

const CartContext = createContext();

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i._id === action.payload._id && i.size === action.payload.size);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i => i._id === action.payload._id && i.size === action.payload.size ? { ...i, quantity: i.quantity + action.payload.quantity } : i)
        };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => !(i._id === action.payload.id && i.size === action.payload.size)) };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(i => i._id === action.payload.id && i.size === action.payload.size ? { ...i, quantity: action.payload.quantity } : i)
      };
    case 'CLEAR_CART':
      return { items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [state, reactDispatch] = useReducer(cartReducer, { items: [] }, (initial) => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('attyer_cart');
      return saved ? JSON.parse(saved) : initial;
    }
    return initial;
  });

  useEffect(() => {
    if (user) {
      const userData = localStorage.getItem('attyer_user');
      const token = userData ? JSON.parse(userData).token : null;
      if (!token) return;
      axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/cart`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          if (res.data.data?.items) {
            reactDispatch({ type: 'CLEAR_CART' });
            res.data.data.items.forEach(item => {
               reactDispatch({ type: 'ADD_ITEM', payload: {
                _id: item.product?._id,
                name: item.product?.name,
                price: item.price || item.product?.discountedPrice || item.product?.price,
                image: item.product?.images?.[0]?.url || '',
                size: item.size,
                quantity: item.quantity
                }});
            });
          }
        }).catch(err => console.error(err));
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('attyer_cart', JSON.stringify(state));
    }
  }, [state, user]);

  const dispatch = async (action) => {
    reactDispatch(action);
    if (user && action.type === 'ADD_ITEM') {
      try {
        const userData = localStorage.getItem('attyer_user');
        const token = userData ? JSON.parse(userData).token : null;
        if (!token) return;
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/cart`, {
          productId: action.payload._id,
          size: action.payload.size,
          quantity: action.payload.quantity
        }, { headers: { Authorization: `Bearer ${token}` } });
      } catch (err) { console.error('Failed to update cart', err); }
    }
  };

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ ...state, totalItems, totalPrice, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
