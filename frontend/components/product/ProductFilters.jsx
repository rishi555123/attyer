'use client';
import { useState } from 'react';
import { Filter, X } from 'lucide-react';

const CATEGORIES = ['Kurta', 'Saree', 'Salwar Suit', 'Dupatta', 'Dress', 'Shirt', 'Trouser'];
const PRINTS = ['sanganeri', 'bagru', 'ajrakh', 'kalamkari', 'bandhani', 'dabu', 'leheriya', 'solid'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
];

export default function ProductFilters({ onFilterChange, activeFilters = {} }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (type, value) => {
    if (activeFilters[type] === value) {
      onFilterChange({ [type]: undefined });
    } else {
      onFilterChange({ [type]: value });
    }
  };

  const isActive = (type, value) => activeFilters[type] === value;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 border border-sand px-4 py-2 text-sm font-label text-kashish tracking-widest rounded-sm hover:bg-sand/10 transition-colors"
      >
        <Filter size={16} /> Filters
        {Object.keys(activeFilters).length > 0 && (
          <span className="bg-terracotta text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
            {Object.keys(activeFilters).length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-12 left-0 w-72 bg-ivory border border-sand/20 shadow-xl rounded-md z-30 p-4">
          <div className="flex justify-between items-center mb-4 border-b border-sand/20 pb-2">
            <h4 className="font-display text-lg text-kashish">Filter By</h4>
            <button onClick={() => setIsOpen(false)}><X size={16} className="text-sand" /></button>
          </div>

          <div className="space-y-5">
            {/* Gender */}
            <div>
              <h5 className="font-label text-xs text-sand uppercase mb-2">Gender</h5>
              <div className="flex gap-2">
                {['men', 'women', 'unisex'].map(g => (
                  <button key={g} onClick={() => handleClick('gender', g)}
                    className={`px-3 py-1 border rounded-full text-xs capitalize transition-all ${isActive('gender', g) ? 'bg-kashish text-white border-kashish' : 'border-sand/30 text-kashish hover:border-terracotta hover:text-terracotta'}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <h5 className="font-label text-xs text-sand uppercase mb-2">Category</h5>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => handleClick('category', c)}
                    className={`px-2 py-1 border rounded text-xs transition-all ${isActive('category', c) ? 'bg-kashish text-white border-kashish' : 'border-sand/30 text-kashish hover:border-terracotta hover:text-terracotta'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Print */}
            <div>
              <h5 className="font-label text-xs text-sand uppercase mb-2">Print Type</h5>
              <div className="flex flex-wrap gap-2">
                {PRINTS.map(p => (
                  <button key={p} onClick={() => handleClick('printType', p)}
                    className={`px-2 py-1 border rounded-full text-xs capitalize transition-all ${isActive('printType', p) ? 'bg-kashish text-white border-kashish' : 'border-sand/30 text-kashish hover:border-terracotta hover:text-terracotta'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <h5 className="font-label text-xs text-sand uppercase mb-2">Size</h5>
              <div className="flex flex-wrap gap-2">
                {SIZES.map(s => (
                  <button key={s} onClick={() => handleClick('size', s)}
                    className={`w-9 h-9 border rounded text-xs transition-all ${isActive('size', s) ? 'bg-kashish text-white border-kashish' : 'border-sand/30 text-kashish hover:border-terracotta hover:text-terracotta'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <h5 className="font-label text-xs text-sand uppercase mb-2">Price Range</h5>
              <div className="flex gap-2 items-center">
                <input type="number" placeholder="Min ₹" 
                  value={activeFilters.minPrice || ''}
                  onChange={(e) => onFilterChange({ minPrice: e.target.value })}
                  className="w-full p-2 text-xs border border-sand/30 rounded focus:border-terracotta outline-none text-kashish bg-transparent" />
                <span className="text-sand">-</span>
                <input type="number" placeholder="Max ₹" 
                  value={activeFilters.maxPrice || ''}
                  onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
                  className="w-full p-2 text-xs border border-sand/30 rounded focus:border-terracotta outline-none text-kashish bg-transparent" />
              </div>
            </div>

            {/* Sort */}
            <div>
              <h5 className="font-label text-xs text-sand uppercase mb-2">Sort By</h5>
              <div className="flex flex-col gap-1">
                {SORT_OPTIONS.map(o => (
                  <button key={o.value} onClick={() => handleClick('sort', o.value)}
                    className={`text-left px-2 py-1.5 text-xs rounded transition-all ${isActive('sort', o.value) ? 'bg-kashish text-white' : 'text-kashish hover:bg-sand/10'}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}