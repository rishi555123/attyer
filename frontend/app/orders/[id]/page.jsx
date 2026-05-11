'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

const STEPS = ['Placed', 'Confirmed', 'Shipped', 'Delivered'];
const RETURN_REASONS = [
  'Wrong size delivered',
  'Damaged product',
  'Wrong product delivered',
  'Product not as described',
  'Changed my mind',
  'Other'
];

function OrderTracker({ status, trackingNumber, estimatedDelivery }) {
  const currentStep = STEPS.indexOf(status);
  return (
    <div className="bg-white border border-sand/20 rounded-lg p-6 mb-6">
      <h2 className="font-display text-xl text-kashish mb-6">Order Tracking</h2>
      <div className="relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-sand/20 z-0" />
        <div className="absolute top-5 left-0 h-0.5 bg-terracotta z-0 transition-all duration-500" style={{ width: `${currentStep === -1 ? 0 : (currentStep / (STEPS.length - 1)) * 100}%` }} />
        <div className="relative z-10 flex justify-between">
          {STEPS.map((step, i) => {
            const isDone = currentStep >= i;
            const isCurrent = currentStep === i;
            return (
              <div key={step} className="flex flex-col items-center gap-2 w-20">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isDone ? 'bg-terracotta border-terracotta text-white' : 'bg-white border-sand/30 text-sand'}`}>
                  {isDone ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> : <span className="text-xs font-bold">{i + 1}</span>}
                </div>
                <span className={`text-xs text-center font-label ${isCurrent ? 'text-terracotta font-semibold' : isDone ? 'text-kashish' : 'text-sand'}`}>{step}</span>
              </div>
            );
          })}
        </div>
      </div>
      {status === 'Cancelled' && <div className="mt-6 p-3 bg-red-50 rounded text-sm text-red-600 text-center">This order has been cancelled.</div>}
      {status === 'Returned' && <div className="mt-6 p-3 bg-blue-50 rounded text-sm text-blue-600 text-center">Return request raised. Admin will process it shortly.</div>}
      {trackingNumber && <div className="mt-6 p-4 bg-ivory rounded border border-sand/20"><p className="text-sm text-sand font-label mb-1">Tracking Number</p><p className="font-medium text-kashish">{trackingNumber}</p></div>}
      {estimatedDelivery && <div className="mt-3 p-4 bg-ivory rounded border border-sand/20"><p className="text-sm text-sand font-label mb-1">Estimated Delivery</p><p className="font-medium text-kashish">{new Date(estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>}
    </div>
  );
}

export default function OrderDetailPage({ params }) {
  const { id } = params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnDetails, setReturnDetails] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const getToken = () => JSON.parse(localStorage.getItem('attyer_user') || '{}')?.token;

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/orders/${id}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      setOrder(res.data.data);
    } catch (err) { setError('Failed to load order'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/orders/${id}/cancel`, {}, { headers: { Authorization: `Bearer ${getToken()}` } });
      setShowCancelModal(false);
      fetchOrder();
    } catch (err) { alert('Failed to cancel order'); }
    finally { setCancelling(false); }
  };

  const handleReturnRequest = async () => {
    if (!returnReason) { alert('Please select a reason'); return; }
    setSubmittingReturn(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/${id}/status`,
        { status: 'Returned', returnReason: `${returnReason}${returnDetails ? ': ' + returnDetails : ''}` },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setShowReturnModal(false);
      fetchOrder();
    } catch (err) { alert('Failed to submit return request'); }
    finally { setSubmittingReturn(false); }
  };

  const canCancel = order && ['Placed', 'Confirmed'].includes(order.orderStatus);
  const canReturn = order && order.orderStatus === 'Delivered';

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-kashish">Loading...</div>;
  if (error) return <div className="max-w-4xl mx-auto px-4 py-12 text-red-500">{error}</div>;
  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-kashish">Order Details</h1>
        <Link href="/orders" className="text-sm text-terracotta underline">← Back to Orders</Link>
      </div>

      <div className="bg-white border border-sand/20 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><p className="text-sand font-label mb-1">Order Number</p><p className="text-kashish font-medium">{order.orderNumber}</p></div>
          <div><p className="text-sand font-label mb-1">Date</p><p className="text-kashish">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>
          <div><p className="text-sand font-label mb-1">Payment</p><p className={`font-medium ${order.paymentInfo?.status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>{order.paymentInfo?.status === 'paid' ? 'Paid' : 'Cash on Delivery'}</p></div>
          <div><p className="text-sand font-label mb-1">Status</p>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' : order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-600' : order.orderStatus === 'Returned' ? 'bg-blue-100 text-blue-700' : order.orderStatus === 'Shipped' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{order.orderStatus}</span>
          </div>
        </div>

        {(canCancel || canReturn) && (
          <div className="mt-4 pt-4 border-t border-sand/20 flex gap-3 items-center">
            {canCancel && (
              <button onClick={() => setShowCancelModal(true)} className="text-sm text-red-500 border border-red-200 px-4 py-2 rounded hover:bg-red-50 transition-colors">
                Cancel Order
              </button>
            )}
            {canReturn && (
              <button onClick={() => setShowReturnModal(true)} className="text-sm text-blue-600 border border-blue-200 px-4 py-2 rounded hover:bg-blue-50 transition-colors">
                Return Order
              </button>
            )}
            <p className="text-xs text-sand">
              {canCancel ? 'Can be cancelled before shipping' : 'Returns accepted within 7 days of delivery'}
            </p>
          </div>
        )}

        {order.returnReason && (
          <div className="mt-4 pt-4 border-t border-sand/20">
            <p className="text-sm text-sand font-label mb-1">Return Reason</p>
            <p className="text-sm text-kashish">{order.returnReason}</p>
          </div>
        )}
      </div>

      <OrderTracker status={order.orderStatus} trackingNumber={order.trackingNumber} estimatedDelivery={order.estimatedDelivery} />

      <div className="bg-white border border-sand/20 rounded-lg p-6 mb-6">
        <h2 className="font-display text-xl text-kashish mb-4">Items Ordered</h2>
        <div className="space-y-4">
          {order.orderItems.map((item, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-sand/10 last:border-0">
              {item.image && <img src={item.image} alt={item.name} className="w-16 h-20 object-cover rounded" />}
              <div className="flex-1"><p className="font-medium text-kashish">{item.name}</p><p className="text-sm text-sand">Size: {item.size} | Qty: {item.quantity}</p></div>
              <p className="font-medium text-kashish">₹{item.price * item.quantity}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-sand/20 rounded-lg p-6">
          <h2 className="font-display text-xl text-kashish mb-4">Shipping Address</h2>
          <p className="text-sm text-kashish leading-relaxed">{order.shippingAddress?.name}<br />{order.shippingAddress?.street}<br />{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}<br />{order.shippingAddress?.country}<br />📞 {order.shippingAddress?.phone}</p>
        </div>
        <div className="bg-white border border-sand/20 rounded-lg p-6">
          <h2 className="font-display text-xl text-kashish mb-4">Price Breakdown</h2>
          <div className="space-y-2 text-sm text-kashish">
            <div className="flex justify-between"><span>Items Total</span><span>₹{order.itemsPrice}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span></div>
            <div className="flex justify-between text-sand"><span>CGST</span><span>₹{order.gstBreakdown?.cgst}</span></div>
            <div className="flex justify-between text-sand"><span>SGST</span><span>₹{order.gstBreakdown?.sgst}</span></div>
            {order.discountAmount > 0 && <div className="flex justify-between text-terracotta"><span>Discount</span><span>-₹{order.discountAmount}</span></div>}
            <div className="flex justify-between font-bold text-base border-t border-sand/20 pt-2 mt-2"><span>Total</span><span className="text-terracotta">₹{order.totalPrice}</span></div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-kashish/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
            <h2 className="font-display text-xl text-kashish mb-3">Cancel Order?</h2>
            <p className="text-sm text-sand mb-6">Are you sure you want to cancel order <strong>{order.orderNumber}</strong>? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelModal(false)} className="flex-1 py-2 border border-sand text-kashish rounded hover:bg-cream">Keep Order</button>
              <button onClick={handleCancel} disabled={cancelling} className="flex-1 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50">{cancelling ? 'Cancelling...' : 'Yes, Cancel'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-kashish/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-xl text-kashish">Request Return</h2>
              <button onClick={() => setShowReturnModal(false)} className="text-sand hover:text-terracotta text-2xl">&times;</button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-label text-kashish mb-2">Reason for Return *</label>
              <select value={returnReason} onChange={e => setReturnReason(e.target.value)} className="w-full p-3 border border-sand/30 rounded focus:outline-terracotta">
                <option value="">Select a reason</option>
                {RETURN_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-label text-kashish mb-2">Additional Details (optional)</label>
              <textarea value={returnDetails} onChange={e => setReturnDetails(e.target.value)} rows={3} placeholder="Describe the issue..." className="w-full p-3 border border-sand/30 rounded focus:outline-terracotta text-sm" />
            </div>
            <p className="text-xs text-sand mb-4">Our team will review your request and contact you within 24-48 hours.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowReturnModal(false)} className="flex-1 py-2 border border-sand text-kashish rounded hover:bg-cream">Cancel</button>
              <button onClick={handleReturnRequest} disabled={submittingReturn} className="flex-1 py-2 bg-kashish text-white rounded hover:bg-terracotta disabled:opacity-50">{submittingReturn ? 'Submitting...' : 'Submit Request'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}