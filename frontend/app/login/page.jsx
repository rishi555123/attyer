'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 min-h-[70vh]">
      <h1 className="font-display text-4xl text-kashish mb-8 text-center">Login to ATTYER</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded border border-sand/30 shadow-sm space-y-4">
        {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>}
        <div>
          <label className="block text-sm font-label text-kashish mb-1">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-3 border border-sand/40 rounded focus:outline-terracotta" />
        </div>
        <div>
          <label className="block text-sm font-label text-kashish mb-1">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-3 border border-sand/40 rounded focus:outline-terracotta" />
        </div>
        <button type="submit" className="w-full bg-kashish text-white py-3 font-label tracking-widest hover:bg-terracotta transition-colors mt-4 rounded">LOGIN</button>
      </form>
      <p className="text-center mt-6 text-sm text-sand">
        Don&apos;t have an account? <Link href="/register" className="text-terracotta hover:underline">Register here</Link>
      </p>
    </div>
  );
}
