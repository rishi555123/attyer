import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-kashish text-cream pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="md:col-span-1">
            <h2 className="font-label text-2xl tracking-[0.2em] mb-6">ATTYER</h2>
            <p className="font-body text-sm text-sand leading-relaxed">
              Heritage meets modern silhouettes. 100% authentic Indian cotton wear, block-printed by artisans.
            </p>
          </div>

          <div>
            <h3 className="font-display text-lg mb-6 text-ivory">Shop</h3>
            <ul className="space-y-3 font-body text-sm text-sand">
              <li><Link href="/shop?category=mens" className="hover:text-terracotta transition">Men&apos;s Wear</Link></li>
              <li><Link href="/shop?category=womens" className="hover:text-terracotta transition">Women&apos;s Wear</Link></li>
              <li><Link href="/shop?filter=prints" className="hover:text-terracotta transition">Heritage Prints</Link></li>
              <li><Link href="/shop?sort=newest" className="hover:text-terracotta transition">New Arrivals</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg mb-6 text-ivory">Support</h3>
            <ul className="space-y-3 font-body text-sm text-sand">
              <li><Link href="/faq" className="hover:text-terracotta transition">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-terracotta transition">Contact Us</Link></li>
              <li><Link href="/returns" className="hover:text-terracotta transition">Returns & Exchanges</Link></li>
              <li><Link href="/shipping" className="hover:text-terracotta transition">Shipping Info</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg mb-6 text-ivory">Connect</h3>
            <ul className="space-y-3 font-body text-sm text-sand">
              <li><a href="https://instagram.com/attyer" target="_blank" rel="noreferrer" className="hover:text-terracotta transition">Instagram</a></li>
              <li><a href="https://facebook.com/attyer" target="_blank" rel="noreferrer" className="hover:text-terracotta transition">Facebook</a></li>
              <li><a href="https://pinterest.com/attyer" target="_blank" rel="noreferrer" className="hover:text-terracotta transition">Pinterest</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-sand/20 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-sand/80">
          <p>&copy; {new Date().getFullYear()} ATTYER. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
