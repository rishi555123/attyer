'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const { dispatch } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  const isWishlisted = wishlist.includes(product._id);
  const price = product.discountedPrice || product.price;

  return (
    <div 
      className="group relative bg-ivory rounded-lg overflow-hidden transition-shadow hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] bg-sand/20 overflow-hidden">
        <Link href={`/product/${product.slug || product._id}`}>
          <Image
            src={product.images?.[0]?.url || '/placeholder.png'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        
        <button
          onClick={() => toggleWishlist(product._id)}
          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow hover:bg-white transition-colors z-10"
        >
          <Heart size={18} className={isWishlisted ? 'fill-deepred text-deepred' : 'text-kashish'} />
        </button>

        <div className={`absolute bottom-0 left-0 right-0 p-3 bg-kashish/90 backdrop-blur-sm text-ivory text-center transition-transform duration-300 ${isHovered ? 'translate-y-0' : 'translate-y-full'}`}>
          <button 
            onClick={() => dispatch({ type: 'ADD_ITEM', payload: { ...product, size: 'M', quantity: 1 } })}
            className="w-full font-label tracking-widest text-xs uppercase hover:text-terracotta"
          >
            Quick Add
          </button>
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs text-sand font-label uppercase tracking-widest mb-1">{product.printType || 'Heritage'}</p>
        <Link href={`/product/${product.slug || product._id}`}>
          <h3 className="font-display text-kashish leading-snug line-clamp-1 hover:text-terracotta transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-semibold text-kashish">₹{price}</span>
          {product.discountedPrice && (
            <span className="text-xs text-kashish/50 line-through">₹{product.price}</span>
          )}
        </div>
      </div>
    </div>
  );
}
