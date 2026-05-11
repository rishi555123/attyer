'use client';
import ProductCard from './ProductCard';
import { SkeletonGrid } from '../layout/SkeletonCard';

export default function ProductGrid({ products, loading }) {
  if (loading) return <SkeletonGrid count={8} />;
  
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-sand">
        <p className="font-body text-lg">No products found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map(product => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
