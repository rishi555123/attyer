import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[85vh] w-full bg-kashish overflow-hidden">
        <Image src="/hero-placeholder.jpg" alt="Heritage Cotton Wear" fill className="object-cover opacity-60" priority />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-ivory text-center px-4">
          <h1 className="font-label text-4xl md:text-6xl tracking-[0.25em] mb-4 animate-fade-up">ATTYER</h1>
          <p className="font-display text-xl md:text-2xl mb-8 text-cream animate-fade-in delay-150">100% Cotton | Indian Prints</p>
          <Link href="/shop" className="bg-terracotta text-white px-8 py-3 font-label tracking-widest uppercase hover:bg-deepred transition-colors animate-fade-in delay-300">
            Shop The Collection
          </Link>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl text-center text-kashish mb-12">Discover by Print</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: 'Sanganeri', img: '/sanganeri.jpg' },
            { name: 'Bagru', img: '/bagru.jpg' },
            { name: 'Ajrakh', img: '/ajrakh.jpg' },
          ].map((print) => (
            <Link key={print.name} href={`/shop?print=${print.name.toLowerCase()}`} className="group relative aspect-[4/5] overflow-hidden bg-sand/20">
              <Image
                src={print.img}
                alt={print.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-kashish/30 group-hover:bg-kashish/10 transition-colors z-10" />
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-center w-full">
                <h3 className="font-label text-2xl text-ivory tracking-widest">{print.name}</h3>
              </div>
            </Link>
          ))}
        </div>
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