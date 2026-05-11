'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import ProductGrid from '@/components/product/ProductGrid';
import ProductFilters from '@/components/product/ProductFilters';

export default function ShopPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({});

  // Read URL params on mount and when they change
  useEffect(() => {
    const params = {};
    if (searchParams.get('gender')) params.gender = searchParams.get('gender');
    if (searchParams.get('category')) params.category = searchParams.get('category');
    if (searchParams.get('printType')) params.printType = searchParams.get('printType');
    if (searchParams.get('sort')) params.sort = searchParams.get('sort');
    setActiveFilters(params);
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Default sort is newest
        const query = new URLSearchParams({ sort: 'newest', ...activeFilters }).toString();
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products?${query}`);
        setProducts(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeFilters]);

  const handleFilterChange = (newFilters) => {
    setActiveFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilter = (key) => {
    setActiveFilters(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl text-kashish mb-8">
        {activeFilters.gender === 'men' ? "Men's Collection" :
         activeFilters.gender === 'women' ? "Women's Collection" :
         'Shop Collection'}
      </h1>

      <div className="flex justify-between items-center mb-4 pb-4 border-b border-sand/20">
        <ProductFilters onFilterChange={handleFilterChange} activeFilters={activeFilters} />
        <span className="font-body text-sm text-sand">{products.length} products found</span>
      </div>

      {/* Active filter tags */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(activeFilters).map(([key, val]) => (
            <span key={key} className="flex items-center gap-1 px-3 py-1 bg-sand/10 text-kashish text-xs rounded-full border border-sand/20">
              {key}: {val}
              <button onClick={() => clearFilter(key)} className="ml-1 text-sand hover:text-terracotta">×</button>
            </span>
          ))}
          <button onClick={() => setActiveFilters({})} className="text-xs text-terracotta underline">Clear all</button>
        </div>
      )}

      <ProductGrid products={products} loading={loading} />
    </div>
  );
}