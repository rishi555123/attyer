'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const TOP_CATEGORIES = ['Kurta', 'Kurti', 'Shirt', 'Blouse', 'Dress', 'Top'];
const SET_CATEGORIES = ['Salwar Suit', 'Palazzo'];
const BOTTOM_CATEGORIES = ['Trouser', 'Skirt'];
const FREE_SIZE_CATEGORIES = ['Saree', 'Dupatta', 'Stole'];

const TOP_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const BOTTOM_SIZES = ['26', '28', '30', '32', '34', '36', '38'];

function getSizeType(category) {
  if (FREE_SIZE_CATEGORIES.includes(category)) return 'free';
  if (SET_CATEGORIES.includes(category)) return 'set';
  if (BOTTOM_CATEGORIES.includes(category)) return 'bottom';
  return 'top';
}

export default function ProductPage({ params }) {
  const { slug } = params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTopSize, setSelectedTopSize] = useState('');
  const [selectedBottomSize, setSelectedBottomSize] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const { dispatch } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    axios.get(`${API_URL}/products/${slug}`)
      .then(res => setProduct(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  const sizeType = product ? getSizeType(product.category) : 'top';
  const isFreeSize = sizeType === 'free';
  const isSet = sizeType === 'set';
  const isBottomOnly = sizeType === 'bottom';

  const topVariants = product?.variants?.filter(v => TOP_SIZES.includes(v.size)) || [];
  const bottomVariants = product?.variants?.filter(v => BOTTOM_SIZES.includes(v.size)) || [];
  const allVariants = product?.variants || [];

  const getStockForSize = (size) => product?.variants?.find(v => v.size === size)?.stock || 0;

  const handleAddToCart = () => {
    if (!isFreeSize) {
      if (isSet) {
        if (!selectedTopSize) { showToast('❌ Please select a top size'); return; }
        if (bottomVariants.length > 0 && !selectedBottomSize) { showToast('❌ Please select a bottom size'); return; }
      } else if (!selectedTopSize) {
        showToast('❌ Please select a size');
        return;
      }
    }

    const sizeLabel = isFreeSize ? 'Free Size' :
                      isSet && selectedBottomSize ? `Top: ${selectedTopSize} / Bottom: ${selectedBottomSize}` :
                      selectedTopSize;

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        _id: product._id,
        name: product.name,
        price: product.discountedPrice || product.price,
        image: product.images?.[0]?.url,
        size: sizeLabel,
        quantity: 1
      }
    });
    showToast('Added to cart!');
  };

  const prevImage = () => setActiveImage(i => i === 0 ? product.images.length - 1 : i - 1);
  const nextImage = () => setActiveImage(i => i === product.images.length - 1 ? 0 : i + 1);

  const SizeButton = ({ size, selected, onSelect }) => {
    const stock = getStockForSize(size);
    const outOfStock = stock === 0;
    const lowStock = stock > 0 && stock <= 3;
    return (
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={() => !outOfStock && onSelect(size)}
          disabled={outOfStock}
          className={`w-14 h-14 border rounded-lg text-sm font-medium transition-all relative ${
            selected === size ? 'bg-kashish text-white border-kashish' :
            outOfStock ? 'border-sand/20 text-sand/30 cursor-not-allowed bg-sand/5' :
            'border-sand/40 text-kashish hover:border-kashish'
          }`}
        >
          {size}
          {outOfStock && <span className="w-full h-px bg-sand/30 absolute rotate-45 top-1/2" />}
        </button>
        {outOfStock && <span className="text-[10px] text-red-400 text-center leading-tight">Out of<br/>stock</span>}
        {lowStock && <span className="text-[10px] text-amber-500 text-center leading-tight">Only {stock}<br/>left</span>}
      </div>
    );
  };

  if (loading) return <div className="p-8 text-center text-kashish">Loading...</div>;
  if (!product) return <div className="p-8 text-center">Product not found</div>;

  const images = product.images || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-12">

      {/* Image Slideshow */}
      <div className="space-y-4">
        <div className="relative aspect-[3/4] bg-sand/10 rounded-lg overflow-hidden group">
          {images.length > 0 && <img src={images[activeImage]?.url} alt={product.name} className="w-full h-full object-cover" />}
          {images.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity text-lg">‹</button>
              <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity text-lg">›</button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => <button key={i} onClick={() => setActiveImage(i)} className={`w-2 h-2 rounded-full transition-all ${i === activeImage ? 'bg-terracotta w-4' : 'bg-white/70'}`} />)}
              </div>
            </>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button key={i} onClick={() => setActiveImage(i)} className={`flex-shrink-0 w-16 h-20 rounded overflow-hidden border-2 transition-all ${i === activeImage ? 'border-terracotta' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div>
        <p className="text-sm text-sand font-label tracking-widest uppercase mb-2">{product.printType} · {product.fabric}</p>
        <h1 className="font-display text-3xl text-kashish mb-3">{product.name}</h1>

        <div className="flex items-baseline gap-3 mb-6">
          {product.discountedPrice ? (
            <>
              <span className="text-2xl font-bold text-terracotta">₹{product.discountedPrice}</span>
              <span className="text-lg text-sand line-through">₹{product.price}</span>
              <span className="text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded">{Math.round((1 - product.discountedPrice / product.price) * 100)}% off</span>
            </>
          ) : (
            <span className="text-2xl font-bold text-kashish">₹{product.price}</span>
          )}
        </div>

        <p className="text-sand leading-relaxed mb-8">{product.description}</p>

        {/* Size Selection */}
        <div className="mb-8 space-y-6">
          {isFreeSize ? (
            <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
              <p className="text-sm text-green-700 font-medium">✓ Free Size — One size fits all</p>
            </div>
          ) : (
            <>
              {/* Top sizes */}
              {(topVariants.length > 0 || (!isBottomOnly && allVariants.length > 0)) && (
                <div>
                  <p className="font-label text-sm text-kashish mb-3 tracking-wide">{isSet ? 'TOP SIZE' : 'SELECT SIZE'}</p>
                  <div className="flex gap-2 flex-wrap">
                    {(topVariants.length > 0 ? topVariants : allVariants).map(v => (
                      <SizeButton key={v.size} size={v.size} selected={selectedTopSize} onSelect={setSelectedTopSize} />
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom sizes — only for sets */}
              {isSet && bottomVariants.length > 0 && (
                <div>
                  <p className="font-label text-sm text-kashish mb-3 tracking-wide">BOTTOM SIZE <span className="text-sand text-xs font-normal normal-case">(waist in inches)</span></p>
                  <div className="flex gap-2 flex-wrap">
                    {bottomVariants.map(v => (
                      <SizeButton key={v.size} size={v.size} selected={selectedBottomSize} onSelect={setSelectedBottomSize} />
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom only */}
              {isBottomOnly && (
                <div>
                  <p className="font-label text-sm text-kashish mb-3 tracking-wide">WAIST SIZE <span className="text-sand text-xs font-normal normal-case">(in inches)</span></p>
                  <div className="flex gap-2 flex-wrap">
                    {(bottomVariants.length > 0 ? bottomVariants : allVariants).map(v => (
                      <SizeButton key={v.size} size={v.size} selected={selectedTopSize} onSelect={setSelectedTopSize} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <button onClick={handleAddToCart} className="w-full bg-kashish text-ivory py-4 font-label tracking-widest uppercase rounded-lg hover:bg-terracotta transition-colors">
          Add to Cart
        </button>
      </div>
    </div>
  );
}