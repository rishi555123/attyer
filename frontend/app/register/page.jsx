'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData.name, formData.email, formData.password, formData.phone);
      router.push('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 min-h-[70vh]">
      <h1 className="font-display text-4xl text-kashish mb-8 text-center">Create Account</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded border border-sand/30 shadow-sm space-y-4">
        {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>}
        <div>
          <label className="block text-sm font-label text-kashish mb-1">Full Name</label>
          <input type="text" name="name" onChange={handleChange} required className="w-full p-3 border border-sand/40 rounded focus:outline-terracotta" />
        </div>
        <div>
          <label className="block text-sm font-label text-kashish mb-1">Email</label>
          <input type="email" name="email" onChange={handleChange} required className="w-full p-3 border border-sand/40 rounded focus:outline-terracotta" />
        </div>
        <div>
          <label className="block text-sm font-label text-kashish mb-1">Phone</label>
          <input type="text" name="phone" onChange={handleChange} className="w-full p-3 border border-sand/40 rounded focus:outline-terracotta" />
        </div>
        <div>
          <label className="block text-sm font-label text-kashish mb-1">Password</label>
          <input type="password" name="password" onChange={handleChange} required minLength={8} className="w-full p-3 border border-sand/40 rounded focus:outline-terracotta" />
        </div>
        <button type="submit" className="w-full bg-kashish text-white py-3 font-label tracking-widest hover:bg-terracotta transition-colors mt-4 rounded">REGISTER</button>
      </form>
      <p className="text-center mt-6 text-sm text-sand">
        Already have an account? <Link href="/login" className="text-terracotta hover:underline">Login here</Link>
      </p>
    </div>
  );
}
