'use client';
import { useState } from 'react';

export default function AdminSettings() {
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <h1 className="font-display text-3xl text-kashish mb-8">Settings</h1>

      <div className="space-y-6 max-w-2xl">
        {/* Store Info */}
        <div className="bg-white border border-sand/20 rounded-lg p-6">
          <h2 className="font-display text-xl text-kashish mb-4">Store Information</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-label text-kashish mb-1">Store Name</label>
              <input defaultValue="ATTYER" className="w-full p-3 border border-sand/30 rounded focus:outline-terracotta" />
            </div>
            <div>
              <label className="block text-sm font-label text-kashish mb-1">Store Email</label>
              <input defaultValue="attyer.store@gmail.com" type="email" className="w-full p-3 border border-sand/30 rounded focus:outline-terracotta" />
            </div>
            <div>
              <label className="block text-sm font-label text-kashish mb-1">Support Phone</label>
              <input defaultValue="+91 98765 43210" className="w-full p-3 border border-sand/30 rounded focus:outline-terracotta" />
            </div>
            <div>
              <label className="block text-sm font-label text-kashish mb-1">Store Address</label>
              <textarea defaultValue="123, Heritage Lane, Jaipur, Rajasthan - 302001" rows={3} className="w-full p-3 border border-sand/30 rounded focus:outline-terracotta" />
            </div>
            <button type="submit" className="bg-kashish text-white px-6 py-2 rounded hover:bg-terracotta transition-colors">
              {saved ? 'Saved ✓' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Shipping */}
        <div className="bg-white border border-sand/20 rounded-lg p-6">
          <h2 className="font-display text-xl text-kashish mb-4">Shipping Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-label text-kashish mb-1">Free Shipping Above (₹)</label>
              <input defaultValue="2000" type="number" className="w-full p-3 border border-sand/30 rounded focus:outline-terracotta" />
            </div>
            <div>
              <label className="block text-sm font-label text-kashish mb-1">Standard Shipping Fee (₹)</label>
              <input defaultValue="100" type="number" className="w-full p-3 border border-sand/30 rounded focus:outline-terracotta" />
            </div>
            <button onClick={handleSave} className="bg-kashish text-white px-6 py-2 rounded hover:bg-terracotta transition-colors">
              {saved ? 'Saved ✓' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* GST */}
        <div className="bg-white border border-sand/20 rounded-lg p-6">
          <h2 className="font-display text-xl text-kashish mb-4">Tax Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-label text-kashish mb-1">Default GST Rate (%)</label>
              <input defaultValue="12" type="number" className="w-full p-3 border border-sand/30 rounded focus:outline-terracotta" />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" defaultChecked id="gst-enabled" className="w-4 h-4" />
              <label htmlFor="gst-enabled" className="text-sm text-kashish">GST included in product price</label>
            </div>
            <button onClick={handleSave} className="bg-kashish text-white px-6 py-2 rounded hover:bg-terracotta transition-colors">
              {saved ? 'Saved ✓' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}