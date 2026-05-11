'use client';
import { useRecentlyViewed } from '@/context/RecentlyViewedContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductGrid from './ProductGrid';

export default function RecentlyViewed() {
  const { recentlyViewed } = useRecentlyViewed();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (recentlyViewed.length === 0) return;
    
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Stub implementation - in real app, fetch products by IDs
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products`);
        setProducts(res.data.data.slice(0, 4));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [recentlyViewed]);

  if (recentlyViewed.length === 0) return null;

  return (
    <div className="py-12 border-t border-sand/20 mt-16">
      <h2 className="font-display text-3xl text-kashish mb-8">Recently Viewed</h2>
      <ProductGrid products={products} loading={loading} />
    </div>
  );
}
