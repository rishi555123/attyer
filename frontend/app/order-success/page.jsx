'use client';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12 text-center">
      <CheckCircle size={80} className="text-green-500 mb-6" />
      <h1 className="font-display text-4xl text-kashish mb-4">Order Placed Successfully!</h1>
      <p className="font-body text-sand mb-2">Thank you for shopping with ATTYER.</p>
      {orderId && <p className="font-body text-sm text-kashish mb-8">Your Order ID is: <span className="font-semibold">{orderId}</span></p>}
      
      <div className="flex gap-4">
        <Link href="/orders" className="bg-ivory text-kashish border border-sand/30 px-6 py-3 font-label tracking-widest hover:bg-cream transition-colors">
          View Order
        </Link>
        <Link href="/shop" className="bg-kashish text-ivory px-6 py-3 font-label tracking-widest hover:bg-terracotta transition-colors">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
