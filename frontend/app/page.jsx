'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import ProductGrid from '@/components/product/ProductGrid';

export default function Home() {
  const router = useRouter();
  const [menProducts, setMenProducts] = useState([]);
  const [womenProducts, setWomenProducts] = useState([]);
  const [loadingMen, setLoadingMen] = useState(true);
  const [loadingWomen, setLoadingWomen] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const [menRes, womenRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products?gender=men&limit=4`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products?gender=women&limit=4`)
        ]);
        // The skeleton loading supports 'count' prop, but ProductGrid uses 8 by default.
        // We will just pass the products to ProductGrid.
        setMenProducts(menRes.data.data || []);
        setWomenProducts(womenRes.data.data || []);
      } catch (error) {
        console.error('Failed to fetch collections', error);
      } finally {
        setLoadingMen(false);
        setLoadingWomen(false);
      }
    };
    fetchCollections();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[85vh] w-full bg-kashish overflow-hidden">
        <Image src="/hero-placeholder.jpg" alt="Heritage Cotton Wear" fill className="object-cover opacity-60" priority />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-ivory text-center px-4">
          <h1 className="font-label text-4xl md:text-6xl tracking-[0.25em] mb-4 animate-fade-up">ATTYER</h1>
          <p className="font-display text-xl md:text-2xl mb-8 text-cream animate-fade-in delay-150">100% Cotton | Indian Prints</p>
          <button onClick={() => document.getElementById('shop-collection')?.scrollIntoView({ behavior: 'smooth' })} className="bg-terracotta text-white px-8 py-3 font-label tracking-widest uppercase hover:bg-deepred transition-colors animate-fade-in delay-300">
            Shop The Collection
          </button>
        </div>
      </section>

      {/* Shop the Collection */}
      <section id="shop-collection" className="py-20 px-4 md:px-8 max-w-7xl mx-auto space-y-20">
        <div>
          <h2 className="font-display text-3xl md:text-4xl text-center text-kashish mb-12">Men's Collection</h2>
          <ProductGrid products={menProducts} loading={loadingMen} />
          <div className="mt-8 text-center">
            <button onClick={() => router.push('/shop?gender=men')} className="bg-[#C0522B] text-white px-8 py-3 font-label tracking-widest uppercase hover:bg-[#8B1A1A] transition-colors">
              See More
            </button>
          </div>
        </div>

        <div>
          <h2 className="font-display text-3xl md:text-4xl text-center text-kashish mb-12">Women's Collection</h2>
          <ProductGrid products={womenProducts} loading={loadingWomen} />
          <div className="mt-8 text-center">
            <button onClick={() => router.push('/shop?gender=women')} className="bg-[#C0522B] text-white px-8 py-3 font-label tracking-widest uppercase hover:bg-[#8B1A1A] transition-colors">
              See More
            </button>
          </div>
        </div>
      </section>


      {/* Featured Categories (Circular Slideshow) */}
      <section className="py-20 max-w-full mx-auto overflow-hidden bg-ivory">
        <div className="max-w-7xl mx-auto mb-10 flex justify-between items-end px-4 md:px-8">
          <h2 className="font-display text-3xl md:text-4xl text-kashish">Discover by Print</h2>
          <Link href="/shop" className="text-terracotta font-label tracking-widest text-sm hover:underline uppercase">See All Prints</Link>
        </div>
        
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 md:gap-10 pb-8 px-4 md:px-8 max-w-7xl mx-auto hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {[
            { name: 'Sanganeri', img: '/sanganeri.jpg' },
            { name: 'Bagru', img: '/bagru.jpg' },
            { name: 'Ajrakh', img: '/ajrakh.jpg' },
            { name: 'Kalamkari', img: '/kalamkari.jpg' },
            { name: 'Bandhani', img: '/bandhani.jpg' },
            { name: 'Dabu', img: '/dabuu.jpg' },
            { name: 'Bagh', img: '/bagh.jpg' },
            { name: 'Leheriya', img: '/leheriya.jpg' },
          ].map((print) => (
            <Link key={print.name} href={`/shop?printType=${print.name.toLowerCase()}`} className="snap-start flex-shrink-0 flex flex-col items-center group">
              <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-xl overflow-hidden border-2 border-transparent group-hover:border-terracotta transition-colors shadow-md">
                <Image
                  src={print.img}
                  alt={print.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-kashish/10 group-hover:bg-transparent transition-colors z-10" />
              </div>
              <h3 className="mt-4 font-label text-sm md:text-base text-kashish tracking-widest uppercase group-hover:text-terracotta transition-colors">{print.name}</h3>
            </Link>
          ))}
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          .hide-scrollbar::-webkit-scrollbar { display: none; }
        `}} />
      </section>

      {/* Brand Promise */}
      <section className="bg-ivory py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="font-display text-3xl text-kashish">Our Heritage</h2>
          <p className="font-body text-sand leading-relaxed">
            Every piece at ATTYER tells a story. We collaborate directly with artisans across India to bring you authentic, 
            hand-block printed cotton wear. No synthetics. No shortcuts. Just pure, breathable fabric adorned with centuries-old motifs.
          </p>
        </div>
      </section>
    </div>
  );
}