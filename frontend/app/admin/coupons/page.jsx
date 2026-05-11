'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@/context/ToastContext';

export default function AdminCoupons() {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minOrderValue: '',
    maxDiscount: '',
    maxUses: '',
    expiryDate: ''
  });

  const getToken = () => JSON.parse(localStorage.getItem('attyer_user') || '{}')?.token;

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/coupons`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setCoupons(res.data.data);
    } catch (err) {
      console.error('Failed to fetch coupons', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this coupon?')) return;
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/coupons/${id}/deactivate`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      showToast('Coupon deactivated');
      fetchCoupons();
    } catch (err) {
      showToast('Failed to deactivate coupon');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        code: formData.code,
        type: formData.type,
        value: Number(formData.value),
        minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : undefined,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
        maxUses: formData.maxUses ? Number(formData.maxUses) : undefined,
        expiryDate: formData.expiryDate
      };

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/coupons`, payload, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      showToast('Coupon created successfully!');
      setIsModalOpen(false);
      setFormData({
        code: '', type: 'percentage', value: '', minOrderValue: '', maxDiscount: '', maxUses: '', expiryDate: ''
      });
      fetchCoupons();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to create coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display text-3xl text-kashish">Coupons</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-kashish text-ivory px-4 py-2 text-sm rounded hover:bg-terracotta">
          Create Coupon
        </button>
      </div>
      
      <div className="bg-white rounded border border-sand/30 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream text-kashish font-label border-b border-sand/30">
            <tr>
              <th className="p-4">Code</th>
              <th className="p-4">Type</th>
              <th className="p-4">Value</th>
              <th className="p-4">Min Order</th>
              <th className="p-4">Expiry</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand/10 text-kashish">
            {loading ? (
              <tr><td className="p-4 text-center text-sand" colSpan="7">Loading coupons...</td></tr>
            ) : coupons.length > 0 ? coupons.map(c => (
              <tr key={c._id} className="hover:bg-cream/20">
                <td className="p-4 font-medium">{c.code}</td>
                <td className="p-4 capitalize">{c.type}</td>
                <td className="p-4">{c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}</td>
                <td className="p-4">₹{c.minOrderValue}</td>
                <td className="p-4">{new Date(c.expiryDate).toLocaleDateString()}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4">
                  {c.isActive && (
                    <button onClick={() => handleDeactivate(c._id)} className="text-xs text-red-500 hover:underline">
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            )) : (
              <tr><td className="p-4 text-center text-sand" colSpan="7">No coupons configured yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-kashish/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display text-kashish">Create New Coupon</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-sand hover:text-terracotta text-2xl">&times;</button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-sm font-label text-kashish mb-1">Code *</label>
                <input required name="code" value={formData.code} onChange={handleInputChange} className="w-full p-2 border border-sand/40 rounded uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-label text-kashish mb-1">Type *</label>
                  <select required name="type" value={formData.type} onChange={handleInputChange} className="w-full p-2 border border-sand/40 rounded">
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-label text-kashish mb-1">Value *</label>
                  <input required type="number" name="value" value={formData.value} onChange={handleInputChange} className="w-full p-2 border border-sand/40 rounded" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-label text-kashish mb-1">Min Order Value</label>
                  <input type="number" name="minOrderValue" value={formData.minOrderValue} onChange={handleInputChange} className="w-full p-2 border border-sand/40 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-label text-kashish mb-1">Max Discount</label>
                  <input type="number" name="maxDiscount" value={formData.maxDiscount} onChange={handleInputChange} className="w-full p-2 border border-sand/40 rounded" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-label text-kashish mb-1">Max Uses</label>
                  <input type="number" name="maxUses" value={formData.maxUses} onChange={handleInputChange} className="w-full p-2 border border-sand/40 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-label text-kashish mb-1">Expiry Date *</label>
                  <input required type="date" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} className="w-full p-2 border border-sand/40 rounded" />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border border-sand text-kashish rounded hover:bg-cream">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-kashish text-ivory rounded hover:bg-terracotta disabled:opacity-50">
                  {isSubmitting ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
