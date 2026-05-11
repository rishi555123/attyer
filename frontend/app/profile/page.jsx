'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/axios';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressData, setAddressData] = useState({ label: '', name: '', phone: '', street: '', city: '', state: '', pincode: '' });
  const { showToast } = useToast();

  useEffect(() => {
    if (user) {
      api.get('/users/profile')
        .then(res => setProfile(res.data.data))
        .catch(err => console.error('Failed to fetch profile', err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users/addresses', addressData);
      setProfile(prev => ({ ...prev, addresses: res.data.data }));
      setShowAddressForm(false);
      setAddressData({ label: '', name: '', phone: '', street: '', city: '', state: '', pincode: '' });
      showToast('Address added successfully!');
    } catch (err) {
      showToast('Failed to add address');
      console.error(err);
    }
  };

  if (loading || !user) return <div className="p-12 text-center text-sand">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex justify-between items-end mb-8 border-b border-sand/20 pb-4">
        <h1 className="font-display text-4xl text-kashish">My Account</h1>
        <button onClick={logout} className="text-terracotta hover:underline font-medium text-sm">Logout</button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-sand/5 p-6 rounded-lg border border-sand/20">
            <h2 className="font-display text-xl text-kashish mb-4">Profile Details</h2>
            <div className="space-y-3 text-kashish font-body text-sm">
              <p><strong className="font-label tracking-wide">Name:</strong> {profile?.name}</p>
              <p><strong className="font-label tracking-wide">Email:</strong> {profile?.email}</p>
              <p><strong className="font-label tracking-wide">Phone:</strong> {profile?.phone || 'Not provided'}</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-sand/5 p-6 rounded-lg border border-sand/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-xl text-kashish">Saved Addresses</h2>
              <button 
                onClick={() => setShowAddressForm(!showAddressForm)} 
                className="text-sm bg-kashish text-white px-4 py-2 rounded hover:bg-terracotta transition-colors"
              >
                {showAddressForm ? 'Cancel' : '+ Add Address'}
              </button>
            </div>

            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="mb-8 p-4 border border-sand/30 rounded bg-white space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-label text-kashish mb-1">Label (e.g. Home, Work)</label>
                    <input type="text" value={addressData.label} onChange={e => setAddressData({...addressData, label: e.target.value})} className="w-full p-2 border border-sand/40 rounded text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs font-label text-kashish mb-1">Receiver Name</label>
                    <input type="text" value={addressData.name} onChange={e => setAddressData({...addressData, name: e.target.value})} className="w-full p-2 border border-sand/40 rounded text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs font-label text-kashish mb-1">Phone Number</label>
                    <input type="text" value={addressData.phone} onChange={e => setAddressData({...addressData, phone: e.target.value})} className="w-full p-2 border border-sand/40 rounded text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs font-label text-kashish mb-1">Pincode</label>
                    <input type="text" value={addressData.pincode} onChange={e => setAddressData({...addressData, pincode: e.target.value})} className="w-full p-2 border border-sand/40 rounded text-sm" required />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-label text-kashish mb-1">Street Address</label>
                    <input type="text" value={addressData.street} onChange={e => setAddressData({...addressData, street: e.target.value})} className="w-full p-2 border border-sand/40 rounded text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs font-label text-kashish mb-1">City</label>
                    <input type="text" value={addressData.city} onChange={e => setAddressData({...addressData, city: e.target.value})} className="w-full p-2 border border-sand/40 rounded text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs font-label text-kashish mb-1">State</label>
                    <input type="text" value={addressData.state} onChange={e => setAddressData({...addressData, state: e.target.value})} className="w-full p-2 border border-sand/40 rounded text-sm" required />
                  </div>
                </div>
                <button type="submit" className="w-full bg-[#0A1128] text-white py-2 rounded text-sm font-medium hover:bg-gray-800">Save Address</button>
              </form>
            )}

            <div className="space-y-4">
              {profile?.addresses?.length === 0 ? (
                <p className="text-sand text-sm italic">You haven't saved any addresses yet.</p>
              ) : (
                profile?.addresses?.map((addr, idx) => (
                  <div key={idx} className="p-4 border border-sand/20 bg-white rounded-lg relative">
                    {addr.label && <span className="absolute top-4 right-4 bg-sand/20 text-kashish text-[10px] px-2 py-1 uppercase tracking-wider rounded">{addr.label}</span>}
                    <p className="font-bold text-kashish mb-1">{addr.name}</p>
                    <p className="text-sm text-kashish mb-2">{addr.phone}</p>
                    <p className="text-sm text-kashish">{addr.street}</p>
                    <p className="text-sm text-kashish">{addr.city}, {addr.state} {addr.pincode}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
