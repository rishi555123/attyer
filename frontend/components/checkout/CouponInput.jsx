'use client';
import { useState } from 'react';
import axios from 'axios';

export default function CouponInput({ onApply, orderTotal }) {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [applied, setApplied] = useState(false);

  const applyCoupon = async () => {
    if (!code) return;
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/coupons/validate`,
        { code, orderTotal },
        { withCredentials: true }
      );
      if (res.data.success) {
        onApply(res.data.data.discount, res.data.data.couponId);
        setMessage(`Coupon applied! You save ₹${res.data.data.discount}`);
        setApplied(true);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Invalid coupon code');
      setApplied(false);
    }
  };

  const removeCoupon = () => {
    onApply(0, null);
    setCode('');
    setMessage('');
    setApplied(false);
  };

  return (
    <div className="bg-ivory p-4 rounded border border-sand/20 mt-4">
      <p className="font-label text-sm mb-2 text-kashish">Have a coupon?</p>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter code"
          disabled={applied}
          className="flex-1 p-2 border border-sand/30 rounded uppercase text-sm disabled:opacity-50"
        />
        {applied ? (
          <button onClick={removeCoupon} className="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600 transition-colors">
            Remove
          </button>
        ) : (
          <button onClick={applyCoupon} className="bg-kashish text-white px-4 py-2 rounded text-sm hover:bg-terracotta transition-colors">
            Apply
          </button>
        )}
      </div>
      {message && <p className={`text-xs mt-2 ${applied ? 'text-green-600' : 'text-red-500'}`}>{message}</p>}
    </div>
  );
}