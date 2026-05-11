'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useWishlist } from '@/context/WishlistContext';
import ProductGrid from '@/components/product/ProductGrid';
import Link from 'next/link';

export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishlist.length === 0) {
      setLoading(false);
      return;
    }
    const fetchWishlist = async () => {
      try {
        // In real app, fetch products by IDs from backend. 
        // We'll just fetch all and filter for stub
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products`);
        setProducts(res.data.data.filter(p => wishlist.includes(p._id)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [wishlist]);

  if (!loading && wishlist.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="font-display text-3xl text-kashish mb-4">Your wishlist is empty</h2>
        <Link href="/shop" className="bg-kashish text-ivory px-8 py-3 font-label tracking-widest hover:bg-terracotta transition-colors">
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl text-kashish mb-8">My Wishlist</h1>
      <ProductGrid products={products} loading={loading} />
    </div>
  );
}
