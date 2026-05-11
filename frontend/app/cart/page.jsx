'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { items, totalPrice, dispatch } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="font-display text-3xl text-kashish mb-4">Your cart is empty</h2>
        <p className="font-body text-sand mb-8">Looks like you haven&apos;t added anything to your cart yet.</p>
        <Link href="/shop" className="bg-kashish text-ivory px-8 py-3 font-label tracking-widest hover:bg-terracotta transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl text-kashish mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-4 sm:gap-6 border-b border-sand/20 pb-6">
              <div className="relative w-24 h-32 flex-shrink-0 bg-sand/20">
                <Image src={item.image || item.images?.[0]?.url || '/placeholder.png'} alt={item.name} fill className="object-cover" unoptimized />
              </div>
              <div className="flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <Link href={`/product/${item.slug || item._id}`}>
                      <h3 className="font-display text-lg text-kashish hover:text-terracotta">{item.name}</h3>
                    </Link>
                    <span className="font-semibold text-kashish">₹{item.price * item.quantity}</span>
                  </div>
                  <p className="text-sm text-sand mt-1">Size: {item.size}</p>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center border border-sand/40 rounded-sm">
                    <button onClick={() => item.quantity > 1 && dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item._id, size: item.size, quantity: item.quantity - 1 } })} className="p-2 text-kashish hover:text-terracotta"><Minus size={14} /></button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item._id, size: item.size, quantity: item.quantity + 1 } })} className="p-2 text-kashish hover:text-terracotta"><Plus size={14} /></button>
                  </div>
                  <button onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: { id: item._id, size: item.size } })} className="text-sand hover:text-deepred transition-colors flex items-center gap-1 text-sm">
                    <Trash2 size={16} /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-ivory p-6 border border-sand/20 rounded-md sticky top-24">
            <h3 className="font-display text-xl text-kashish mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm text-kashish border-b border-sand/20 pb-4 mb-4">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{totalPrice}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>Calculated at checkout</span></div>
            </div>
            <div className="flex justify-between items-center font-display text-xl text-kashish mb-6">
              <span>Estimated Total</span>
              <span className="text-terracotta">₹{totalPrice}</span>
            </div>
            <Link href="/checkout" className="w-full bg-kashish text-ivory py-4 flex items-center justify-center gap-2 font-label tracking-widest uppercase hover:bg-terracotta transition-colors">
              Proceed to Checkout <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
