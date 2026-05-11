'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import AddressForm from '@/components/checkout/AddressForm';
import OrderSummary from '@/components/checkout/OrderSummary';
import CouponInput from '@/components/checkout/CouponInput';
import axios from 'axios';

export default function CheckoutPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { items, totalPrice, dispatch } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [address, setAddress] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [couponId, setCouponId] = useState(null);

  const subtotal = totalPrice - discount;
  const shippingPrice = subtotal > 2000 ? 0 : 100;
  const totalGst = Math.round(subtotal * 0.12);
  const finalTotal = subtotal + shippingPrice + totalGst;
  const gstBreakdown = { cgst: totalGst / 2, sgst: totalGst / 2, igst: 0, totalGst };

  useEffect(() => {
    if (items.length === 0 && step === 1) router.push('/cart');
  }, [items, router, step]);

  const handleAddressSubmit = (addr) => {
    setAddress(addr);
    setStep(2);
  };

  const handlePaymentSuccess = async (paymentInfo) => {
    try {
      const orderData = {
        orderItems: items.map(i => ({
          product: i._id,
          name: i.name,
          quantity: i.quantity,
          image: i.image || i.images?.[0]?.url || '',
          price: i.price,
          size: i.size
        })),
        shippingAddress: address,
        itemsPrice: totalPrice,
        shippingPrice,
        totalPrice: finalTotal,
        gstBreakdown,
        discountAmount: discount,
        couponApplied: couponId || undefined,
        paymentInfo: {
          status: paymentInfo.paymentMethod === 'cod' ? 'pending' : 'paid',
          ...paymentInfo
        }
      };

      const token = JSON.parse(localStorage.getItem('attyer_user'))?.token;
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/orders`,
        orderData,
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      dispatch({ type: 'CLEAR_CART' });
      showToast('Order placed successfully!');
      router.push(`/order-success?id=${res.data.data._id}`);
    } catch (err) {
      console.error(err);
      showToast('Order failed to save');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-display text-4xl text-kashish mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {step === 1 ? (
            <AddressForm onSubmit={handleAddressSubmit} />
          ) : (
            <div className="bg-white p-6 rounded border border-sand/30">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display text-xl text-kashish">Delivery Address</h3>
                <button onClick={() => setStep(1)} className="text-sm text-terracotta underline">Edit</button>
              </div>
              <p className="text-sm text-kashish">{address.name}, {address.street}, {address.city}, {address.state} - {address.pincode}</p>
              <button 
                onClick={() => setShowConfirmModal(true)} 
                className="w-full bg-[#C0522B] text-white py-4 rounded font-label tracking-widest uppercase shadow-md hover:bg-[#8B1A1A] transition-colors mt-6"
              >
                Proceed to Payment
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <OrderSummary
            cartItems={items}
            itemsPrice={totalPrice}
            shippingPrice={shippingPrice}
            gstBreakdown={gstBreakdown}
            discount={discount}
            total={finalTotal}
          />
          {step === 1 && (
            <CouponInput
              onApply={(discountAmount, id) => {
                setDiscount(discountAmount);
                setCouponId(id);
              }}
              orderTotal={totalPrice}
            />
          )}
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-[#4A3728]/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#F5EFE0] p-8 rounded-lg shadow-xl w-full max-w-md border border-[#D4B483]/30">
            <h2 className="text-2xl font-display text-[#4A3728] mb-4">Confirm Your Order</h2>
            <div className="mb-6 space-y-2 text-sm text-[#4A3728]">
              <p><strong>Items:</strong> {items.reduce((acc, item) => acc + item.quantity, 0)}</p>
              <p><strong>Total Amount:</strong> ₹{finalTotal}</p>
              <p><strong>Delivery Address:</strong> {address.name}, {address.street}, {address.city}, {address.state} - {address.pincode}</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowConfirmModal(false)} 
                className="flex-1 px-4 py-2 border border-[#C0522B] text-[#C0522B] rounded hover:bg-[#C0522B]/10 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowConfirmModal(false);
                  handlePaymentSuccess({ paymentMethod: 'cod' });
                }} 
                className="flex-1 px-4 py-2 bg-[#C0522B] text-white rounded hover:bg-[#8B1A1A] transition-colors"
              >
                Yes, Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}