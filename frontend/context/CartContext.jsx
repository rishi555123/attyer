'use client';
import { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/axios';

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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('attyer_cart');
      }
      return { items: [] };
    case 'SET_CART': {
      const isSame = JSON.stringify(state.items) === JSON.stringify(action.payload);
      return isSame ? state : { items: action.payload };
    }
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [state, reactDispatch] = useReducer(cartReducer, { items: [] }, (initial) => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('attyer_cart');
      return saved ? JSON.parse(saved) : initial;
    }
    return initial;
  });

  useEffect(() => {
    if (user) {
      api.get('/cart')
        .then(res => {
          if (res.data.data?.items) {
            const newItems = res.data.data.items.map(item => ({
              _id: item.product?._id,
              name: item.product?.name,
              price: item.price || item.product?.discountedPrice || item.product?.price,
              image: item.product?.images?.[0]?.url || '',
              size: item.size,
              quantity: item.quantity
            }));
            reactDispatch({ type: 'SET_CART', payload: newItems });
          }
        }).catch(err => showToast('Failed to fetch cart'));
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('attyer_cart', JSON.stringify(state));
    }
  }, [state, user]);

  const dispatch = async (action) => {
    reactDispatch(action);
    if (!user) return;
    
    try {
      if (action.type === 'ADD_ITEM') {
        await api.post('/cart', {
          productId: action.payload._id,
          size: action.payload.size,
          quantity: action.payload.quantity
        });
      } else if (action.type === 'CLEAR_CART') {
        await api.delete('/cart');
      } else if (action.type === 'REMOVE_ITEM') {
        await api.delete(`/cart/item/${action.payload.id}/${action.payload.size}`);
      } else if (action.type === 'UPDATE_QUANTITY') {
        await api.put(`/cart/item/${action.payload.id}/${action.payload.size}`, {
          quantity: action.payload.quantity
        });
      }
    } catch (err) {
      showToast('Failed to update backend cart');
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
