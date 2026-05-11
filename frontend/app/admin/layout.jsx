'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading || !user) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex bg-cream min-h-screen">
      <AdminSidebar />
      <div className="ml-64 flex-1 p-8">
        <div className="bg-ivory rounded-lg shadow-sm border border-sand/20 min-h-[85vh] p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
