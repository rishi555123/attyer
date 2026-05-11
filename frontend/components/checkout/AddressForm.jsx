'use client';
import { useState } from 'react';

export default function AddressForm({ onSubmit }) {
  const [address, setAddress] = useState({
    name: '', phone: '', street: '', city: '', state: '', pincode: '', country: 'India'
  });

  const handleChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSubmit(address); }}>
      <h3 className="font-display text-xl text-kashish mb-4 border-b border-sand/20 pb-2">Shipping Address</h3>
      <div className="grid grid-cols-2 gap-4">
        <input name="name" placeholder="Full Name" onChange={handleChange} required className="col-span-2 p-3 bg-white border border-sand/30 rounded focus:outline-terracotta" />
        <input name="phone" placeholder="Phone Number" onChange={handleChange} required className="col-span-2 p-3 bg-white border border-sand/30 rounded focus:outline-terracotta" />
        <input name="street" placeholder="Street Address" onChange={handleChange} required className="col-span-2 p-3 bg-white border border-sand/30 rounded focus:outline-terracotta" />
        <input name="city" placeholder="City" onChange={handleChange} required className="p-3 bg-white border border-sand/30 rounded focus:outline-terracotta" />
        <input name="state" placeholder="State" onChange={handleChange} required className="p-3 bg-white border border-sand/30 rounded focus:outline-terracotta" />
        <input name="pincode" placeholder="Pincode" onChange={handleChange} required maxLength={6} className="p-3 bg-white border border-sand/30 rounded focus:outline-terracotta" />
        <input name="country" value={address.country} readOnly className="p-3 bg-sand/10 border border-sand/30 rounded text-sand cursor-not-allowed" />
      </div>
      <button type="submit" className="w-full bg-kashish text-white py-3 rounded hover:bg-terracotta transition-colors">
        Deliver to this address
      </button>
    </form>
  );
}