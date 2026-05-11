'use client';
import Script from 'next/script';
import { useState } from 'react';
import axios from 'axios';
import { useCart } from '@/context/CartContext';

export default function PaymentForm({ orderData, onSuccess }) {
  const { dispatch } = useCart();
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('cod'); // 'cod' or 'razorpay'

  const handleCOD = async () => {
    setLoading(true);
    try {
      await onSuccess({ paymentMethod: 'cod' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpay = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/create-order`,
        { amount: orderData.totalPrice },
        { withCredentials: true }
      );

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: 'INR',
        name: 'ATTYER',
        description: 'Authentic Indian Cotton Wear',
        order_id: data.order.id,
        handler: async (response) => {
          await onSuccess({
            paymentMethod: 'razorpay',
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          dispatch({ type: 'CLEAR_CART' });
        },
        prefill: {
          name: orderData.shippingAddress?.name || '',
          contact: orderData.shippingAddress?.phone || ''
        },
        theme: { color: '#C0522B' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert('Payment initialization failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="mt-6 space-y-3">
        <p className="font-label text-sm text-kashish mb-2">Select Payment Method</p>

        {/* COD Option */}
        <div
          onClick={() => setMethod('cod')}
          className={`flex items-center gap-3 p-4 border rounded cursor-pointer transition-colors ${method === 'cod' ? 'border-terracotta bg-terracotta/5' : 'border-sand/30'}`}
        >
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${method === 'cod' ? 'border-terracotta' : 'border-sand'}`}>
            {method === 'cod' && <div className="w-2 h-2 rounded-full bg-terracotta" />}
          </div>
          <div>
            <p className="font-label text-sm text-kashish">Cash on Delivery</p>
            <p className="text-xs text-sand">Pay when your order arrives</p>
          </div>
        </div>

        {/* Razorpay Option */}
        <div
          onClick={() => setMethod('razorpay')}
          className={`flex items-center gap-3 p-4 border rounded cursor-pointer transition-colors ${method === 'razorpay' ? 'border-terracotta bg-terracotta/5' : 'border-sand/30'}`}
        >
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${method === 'razorpay' ? 'border-terracotta' : 'border-sand'}`}>
            {method === 'razorpay' && <div className="w-2 h-2 rounded-full bg-terracotta" />}
          </div>
          <div>
            <p className="font-label text-sm text-kashish">Pay Online</p>
            <p className="text-xs text-sand">UPI, Cards, Netbanking via Razorpay</p>
          </div>
        </div>

        <button
          onClick={method === 'cod' ? handleCOD : handleRazorpay}
          disabled={loading}
          className="w-full bg-terracotta text-white py-4 rounded font-label tracking-widest uppercase shadow-md hover:bg-deepred transition-colors disabled:opacity-50 mt-2"
        >
          {loading ? 'Processing...' : method === 'cod' ? 'Place Order' : 'Pay Securely'}
        </button>
      </div>
    </>
  );
}