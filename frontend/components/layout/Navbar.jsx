'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Heart, Search, Menu, MessageCircle, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import MobileMenu from './MobileMenu';

function ClientOnly({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return children;
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`sticky top-0 z-40 bg-ivory transition-shadow ${scrolled ? 'shadow-md' : ''}`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <button className="lg:hidden p-2 text-kashish" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>

          <Link href="/" className="font-label text-2xl lg:text-3xl tracking-[0.2em] text-kashish">
            ATTYER
          </Link>

          <div className="hidden lg:flex gap-8 items-center font-body text-sm tracking-wide">
            <Link href="/" className="hover:text-terracotta transition-colors">Home</Link>
            <button onClick={() => router.push('/shop?gender=men')} className="hover:text-terracotta transition-colors">Men&apos;s</button>
            <button onClick={() => router.push('/shop?gender=women')} className="hover:text-terracotta transition-colors">Women&apos;s</button>
            <button onClick={() => router.push('/shop?sort=newest')} className="hover:text-terracotta transition-colors">New Arrivals</button>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 text-kashish">
            <Link href="/search" className="flex flex-col items-center p-1 hover:text-terracotta transition-colors text-[#4A3728]">
              <Search size={24} strokeWidth={2} />
              <span className="text-[10px] font-body uppercase mt-0.5">Search</span>
            </Link>
            <Link href="/wishlist" className="hidden sm:flex flex-col items-center p-1 hover:text-terracotta transition-colors text-[#4A3728]">
              <Heart size={24} strokeWidth={2} />
              <span className="text-[10px] font-body uppercase mt-0.5">Wishlist</span>
            </Link>

            {user ? (
              <div className="relative group">
                <button className="p-2 hover:text-terracotta transition-colors flex items-center gap-1">
                  <User size={20} />
                  <span className="text-sm font-label hidden md:inline-block max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                </button>
                <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block z-50">
                  <div className="bg-ivory shadow-xl rounded-md border border-sand/20 py-2 overflow-hidden">
                    <Link href="/profile" className="block px-4 py-2 text-sm font-body text-kashish hover:bg-cream hover:text-terracotta transition-colors">Profile</Link>
                    <Link href="/orders" className="block px-4 py-2 text-sm font-body text-kashish hover:bg-cream hover:text-terracotta transition-colors">My Orders</Link>
                    {user.role === 'admin' && (
                      <Link href="/admin/dashboard" className="block px-4 py-2 text-sm font-body text-kashish hover:bg-cream hover:text-terracotta transition-colors">Admin Dashboard</Link>
                    )}
                    <div className="border-t border-sand/20 my-1"></div>
                    <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm font-body text-red-600 hover:bg-cream transition-colors">Logout</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3 text-sm font-label tracking-widest ml-1">
                <Link href="/login" className="px-2 hover:text-terracotta transition-colors">LOGIN</Link>
                <Link href="/register" className="bg-kashish text-ivory px-3 py-1.5 rounded hover:bg-terracotta transition-colors">REGISTER</Link>
              </div>
            )}
            <Link href="/cart" className="relative flex flex-col items-center p-1 hover:text-terracotta transition-colors text-[#4A3728]">
              <div className="relative">
                <ShoppingBag size={24} strokeWidth={2} />
                <ClientOnly>
                  {totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 bg-[#C0522B] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border border-ivory font-bold">
                      {totalItems}
                    </span>
                  )}
                </ClientOnly>
              </div>
              <span className="text-[10px] font-body uppercase mt-0.5">Cart</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* WhatsApp CTA */}
      <a 
        href="https://wa.me/919876543210" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 bg-green-500 text-white p-3 rounded-full shadow-lg z-50 hover:bg-green-600 transition-colors flex items-center justify-center"
      >
        <MessageCircle size={24} />
      </a>

      {mobileMenuOpen && <MobileMenu onClose={() => setMobileMenuOpen(false)} />}
    </>
  );
}
