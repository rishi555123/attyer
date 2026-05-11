'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Users, Ticket, RefreshCcw, Settings, LogOut } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: ShoppingBag },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
  { name: 'Returns', href: '/admin/returns', icon: RefreshCcw },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-kashish text-ivory h-screen flex flex-col fixed left-0 top-0 overflow-y-auto">
      <div className="p-8 border-b border-white/10">
        <h1 className="font-label text-2xl tracking-widest text-cream">ATTYER Admin</h1>
      </div>
      
      <nav className="flex-1 py-6 px-4 space-y-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-md font-body text-sm transition-colors
                ${isActive ? 'bg-terracotta text-white' : 'text-cream/70 hover:bg-white/5 hover:text-cream'}`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 mt-auto">
        <button onClick={logout} className="flex items-center gap-3 px-4 py-3 w-full rounded-md font-body text-sm text-red-300 hover:bg-white/5 transition-colors">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
