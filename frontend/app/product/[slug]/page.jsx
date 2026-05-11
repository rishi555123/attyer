'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/axios';

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
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewFiles, setReviewFiles] = useState([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const { dispatch } = useCart();
  const { showToast } = useToast();
  const router = useRouter();

  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/products/${slug}`)
      .then(res => {
        setProduct(res.data.data);
        return res.data.data._id;
      })
      .then(productId => {
        api.get(`/reviews/${productId}`)
          .then(res => setReviews(res.data.data))
          .catch(err => console.error('Failed to fetch reviews', err));
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  const uploadImageToCloudinary = async (file) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'attyer_preset');
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, data
    );
    return { url: res.data.secure_url, public_id: res.data.public_id };
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (reviewRating === 0) return showToast('Please select a rating');
    setIsSubmittingReview(true);
    
    try {
      const uploadedImages = [];
      for (const file of reviewFiles) {
        const uploaded = await uploadImageToCloudinary(file);
        uploadedImages.push(uploaded);
      }

      const res = await api.post(`/reviews/${product._id}`, {
        rating: reviewRating,
        comment: reviewText,
        images: uploadedImages
      });
      showToast('Review submitted successfully!');
      setReviews(prev => [...prev, res.data.data]);
      setReviewRating(0);
      setReviewText('');
      setReviewFiles([]);
      e.target.reset();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit review. Please login.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

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
        quantity: quantity
      }
    });
    showToast('Added to cart!');
  };

  const prevImage = () => setActiveImage(i => i === 0 ? product.images.length - 1 : i - 1);
  const nextImage = () => setActiveImage(i => i === product.images.length - 1 ? 0 : i + 1);

  const SizeButton = ({ size, selected, onSelect }) => {
    const stock = getStockForSize(size);
    const outOfStock = stock === 0;
    const lowStock = stock > 0 && stock < 5;
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

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="w-full aspect-[4/5] bg-sand/20 rounded-2xl"></div>
          <div className="flex gap-4">
            <div className="w-20 h-24 bg-sand/20 rounded-lg"></div>
            <div className="w-20 h-24 bg-sand/20 rounded-lg"></div>
            <div className="w-20 h-24 bg-sand/20 rounded-lg"></div>
          </div>
        </div>
        <div className="space-y-6 pt-4">
          <div className="w-1/3 h-4 bg-sand/20 rounded"></div>
          <div className="w-3/4 h-10 bg-sand/20 rounded"></div>
          <div className="w-1/4 h-8 bg-sand/20 rounded"></div>
          <div className="w-full h-24 bg-sand/20 rounded mt-8"></div>
          <div className="w-1/2 h-12 bg-sand/20 rounded"></div>
          <div className="w-full h-14 bg-sand/20 rounded"></div>
        </div>
      </div>
    </div>
  );
  if (!product) return <div className="p-8 text-center">Product not found</div>;

  const images = product.images || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Slideshow */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] bg-sand/5 rounded-2xl overflow-hidden group">
            {images.length > 0 && <Image src={images[activeImage]?.url} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority />}
            {images.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity text-lg">‹</button>
                <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity text-lg">›</button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)} className={`relative flex-shrink-0 w-20 h-24 rounded-lg overflow-hidden border-2 transition-all ${i === activeImage ? 'border-kashish' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                  <Image src={img.url} alt={`Thumbnail ${i + 1}`} fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <p className="text-sm text-sand font-label tracking-widest uppercase mb-2">{product.printType} · {product.fabric}</p>
          <h1 className="font-display text-3xl md:text-4xl text-kashish mb-4 font-bold">{product.name}</h1>
          
          <div className="flex items-center gap-2 mb-4 text-kashish">
            <div className="flex text-[#2C3E7A]">
              {'★★★★★'.split('').map((star, i) => <span key={i}>{star}</span>)}
            </div>
            <span className="text-sm text-sand">(1)</span>
          </div>

          <div className="flex items-center gap-3 mb-6">
            {product.discountedPrice ? (
              <>
                <span className="text-2xl font-bold text-[#2C3E7A]">Rs. {product.discountedPrice}</span>
                <span className="text-lg text-sand line-through">Rs. {product.price}</span>
                <span className="text-sm bg-blue-500 text-white px-2 py-0.5 rounded">Sale</span>
              </>
            ) : (
              <span className="text-2xl font-bold text-kashish">Rs. {product.price}</span>
            )}
          </div>

          {/* Color (Mock) */}
          <p className="font-body text-sm text-kashish mb-2">color</p>
          <div className="flex gap-2 mb-6">
            <div className="px-5 py-1.5 bg-[#0A1128] text-white rounded-full text-sm font-medium cursor-pointer">Default</div>
          </div>

          {/* Size Selection */}
          <div className="mb-6 space-y-6">
            {isFreeSize ? (
              <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                <p className="text-sm text-green-700 font-medium">✓ Free Size — One size fits all</p>
              </div>
            ) : (
              <>
                {(topVariants.length > 0 || (!isBottomOnly && allVariants.length > 0)) && (
                  <div>
                    <p className="font-body text-sm text-kashish mb-2">size</p>
                    <div className="flex gap-2 flex-wrap">
                      {(topVariants.length > 0 ? topVariants : allVariants).map(v => (
                        <SizeButton
                          key={v.size}
                          size={v.size}
                          selected={selectedTopSize}
                          onSelect={setSelectedTopSize}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {bottomVariants.length > 0 && (
                  <div className="mt-4">
                    <p className="font-body text-sm text-kashish mb-2">bottom size (waist)</p>
                    <div className="flex gap-2 flex-wrap">
                      {bottomVariants.map(v => (
                        <SizeButton
                          key={v.size}
                          size={v.size}
                          selected={selectedBottomSize}
                          onSelect={setSelectedBottomSize}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Quantity */}
          <p className="font-body text-sm text-kashish mb-2">Quantity</p>
          <div className="flex items-center border border-kashish rounded-full w-fit mb-8">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-1 text-kashish hover:text-terracotta">-</button>
            <span className="px-4 py-1 text-sm">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-1 text-kashish hover:text-terracotta">+</button>
          </div>

          <div className="space-y-4">
            <button onClick={handleAddToCart} className="w-full bg-black text-white py-3.5 font-medium rounded hover:bg-gray-900 transition-colors">
              Add to cart
            </button>
          </div>

          {/* Description & Details */}
          <div className="mt-12 space-y-6 text-kashish font-body leading-relaxed text-[15px]">
            <p>{product.description}</p>
            <div className="space-y-4 pt-4">
              <p><strong>Fabric:</strong> {product.fabric || '100% cotton, 180 GSM – breathable and comfy for everyday wear.'}</p>
              <p><strong>Fit:</strong> Regular unisex fit – clean, classic, and made to suit all body types.</p>
              <p><strong>Care:</strong> Wash inside-out in cold water, dry on low heat. Flip it inside out before ironing.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Review Section */}
      <div className="mt-20 border-t border-sand/20 pt-12">
        <h2 className="font-display text-2xl text-kashish mb-8">Customer Reviews</h2>
        
        {/* Display Reviews */}
        <div className="mb-12 space-y-8">
          {reviews.length === 0 ? (
            <p className="text-sand italic">No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev._id} className="border-b border-sand/20 pb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex text-[#2C3E7A]">
                    {Array(5).fill(0).map((_, i) => (
                      <span key={i} className={i < rev.rating ? 'text-[#2C3E7A]' : 'text-sand/30'}>★</span>
                    ))}
                  </div>
                  <span className="font-medium text-kashish text-sm">{rev.user?.name || 'Customer'} {rev.isVerifiedPurchase && <span className="text-green-600 ml-1 text-xs">✓ Verified Buyer</span>}</span>
                </div>
                {rev.title && <p className="font-bold text-kashish mb-1">{rev.title}</p>}
                <p className="text-kashish mb-4">{rev.comment}</p>
                {rev.images && rev.images.length > 0 && (
                  <div className="flex gap-2">
                    {rev.images.map((img, i) => (
                      <div key={i} className="relative w-20 h-20 bg-sand/20 rounded overflow-hidden">
                        <Image src={img.url} fill className="object-cover" alt="Review Image" sizes="80px" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Write a Review */}
        <div className="bg-sand/5 p-6 md:p-8 rounded-lg max-w-2xl border border-sand/20">
          <h3 className="font-display text-xl text-kashish mb-6">Write a Review</h3>
          <form onSubmit={submitReview} className="space-y-6">
            <div>
              <label className="block text-sm mb-2 text-kashish">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setReviewRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className={`text-2xl transition-colors ${star <= (hoverRating || reviewRating) ? 'text-[#2C3E7A]' : 'text-sand/40'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm mb-2 text-kashish">Review</label>
              <textarea 
                rows="4" 
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full p-3 border border-sand/40 rounded bg-white outline-none focus:border-kashish" 
                placeholder="Share your thoughts about this product..." 
                required
              ></textarea>
            </div>

            <div>
              <label className="block text-sm mb-2 text-kashish">Add Photos or Video</label>
              <input 
                type="file" 
                accept="image/*,video/*" 
                multiple
                onChange={(e) => setReviewFiles(Array.from(e.target.files))}
                className="block w-full text-sm text-kashish file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-[#0A1128] file:text-white hover:file:bg-gray-800 cursor-pointer" 
              />
            </div>

            <button type="submit" disabled={reviewRating === 0 || isSubmittingReview} className="bg-[#0A1128] text-white px-8 py-3 rounded font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}