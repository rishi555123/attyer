'use client';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) return <div className="p-12 text-center">Please login</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-display text-4xl text-kashish mb-8">My Account</h1>
      
      <div className="bg-ivory p-6 rounded border border-sand/20">
        <h2 className="font-label text-xl mb-4">Profile Details</h2>
        <div className="space-y-2 mb-8 text-kashish">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
        <button onClick={logout} className="text-red-600 hover:underline">Logout</button>
      </div>
    </div>
  );
}
