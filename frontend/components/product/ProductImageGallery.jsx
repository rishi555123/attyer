'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function ProductImageGallery({ images }) {
  const [activeImage, setActiveImage] = useState(images[0]?.url || '/placeholder.png');

  if (!images || images.length === 0) return null;

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnail List */}
      <div className="flex md:flex-col gap-3 overflow-x-auto md:w-24">
        {images.map((img, idx) => (
          <button 
            key={idx}
            onClick={() => setActiveImage(img.url)}
            className={`relative w-20 h-24 flex-shrink-0 border-2 overflow-hidden ${activeImage === img.url ? 'border-terracotta' : 'border-transparent'}`}
          >
            <Image src={img.url} alt={`Thumbnail ${idx}`} fill className="object-cover" />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative aspect-[3/4] flex-grow bg-cream overflow-hidden cursor-zoom-in group">
        <Image 
          src={activeImage} 
          alt="Product image" 
          fill 
          className="object-cover transition-transform duration-700 group-hover:scale-150" 
        />
      </div>
    </div>
  );
}
