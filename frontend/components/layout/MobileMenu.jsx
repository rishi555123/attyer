'use client';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MobileMenu({ onClose }) {
  const router = useRouter();
  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-kashish/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-4/5 max-w-sm bg-ivory h-full shadow-2xl flex flex-col animate-slide-in">
        <div className="p-5 flex items-center justify-between border-b border-sand/30">
          <span className="font-label text-xl tracking-widest text-kashish">ATTYER</span>
          <button onClick={onClose} className="p-2 text-kashish hover:text-terracotta">
            <X size={24} />
          </button>
        </div>

        <nav className="p-6 flex flex-col gap-6 font-display text-xl text-kashish flex-grow overflow-y-auto">
          <Link href="/" onClick={onClose} className="hover:text-terracotta transition-colors">Home</Link>
          <button onClick={() => { router.push('/shop?gender=men'); onClose(); }} className="text-left hover:text-terracotta transition-colors">Men&apos;s Collection</button>
          <button onClick={() => { router.push('/shop?gender=women'); onClose(); }} className="text-left hover:text-terracotta transition-colors">Women&apos;s Collection</button>
          <button onClick={() => { router.push('/shop?sort=newest'); onClose(); }} className="text-left hover:text-terracotta transition-colors">New Arrivals</button>
          <button onClick={() => { router.push('/shop'); onClose(); }} className="text-left hover:text-terracotta transition-colors">Shop All</button>
          <div className="border-t border-sand/30 my-2" />
          <Link href="/wishlist" onClick={onClose} className="hover:text-terracotta transition-colors text-lg">My Wishlist</Link>
          <Link href="/profile" onClick={onClose} className="hover:text-terracotta transition-colors text-lg">My Account</Link>
          <Link href="/about" onClick={onClose} className="hover:text-terracotta transition-colors text-lg">Our Story</Link>
        </nav>

        <div className="p-6 border-t border-sand/30 bg-cream font-body text-sm text-kashish/80">
          <p>Need help?</p>
          <a href="mailto:support@attyer.com" className="font-medium hover:text-terracotta">support@attyer.com</a>
        </div>
      </div>
    </div>
  );
}
