'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

const STATUSES = ['Placed', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  const getToken = () => JSON.parse(localStorage.getItem('attyer_user') || '{}')?.token;

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setOrders(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusUpdate = async () => {
    if (!statusUpdate) return;
    setUpdating(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/${selectedOrder._id}/status`,
        { status: statusUpdate, trackingNumber },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      alert('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const statusColor = (s) => {
    if (s === 'Delivered') return 'bg-green-100 text-green-700';
    if (s === 'Cancelled') return 'bg-red-100 text-red-600';
    if (s === 'Shipped') return 'bg-blue-100 text-blue-700';
    if (s === 'Confirmed') return 'bg-purple-100 text-purple-700';
    if (s === 'Returned') return 'bg-orange-100 text-orange-700';
    return 'bg-amber-100 text-amber-700';
  };

  return (
    <div>
      <h1 className="font-display text-3xl text-kashish mb-8">Orders Management</h1>

      <div className="bg-white rounded border border-sand/30 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream text-kashish font-label border-b border-sand/30">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Date</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand/10 text-kashish">
            {loading ? (
              <tr><td className="p-4 text-center text-sand" colSpan="6">Loading orders...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td className="p-4 text-center text-sand" colSpan="6">No orders found.</td></tr>
            ) : orders.map(order => (
              <tr key={order._id} className="hover:bg-cream/20">
                <td className="p-4 font-medium">{order.orderNumber}</td>
                <td className="p-4">
                  <p>{order.user?.name || 'N/A'}</p>
                  <p className="text-xs text-sand">{order.user?.email}</p>
                </td>
                <td className="p-4">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td className="p-4">₹{order.totalPrice}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </td>
                <td className="p-4 flex gap-3">
                  <button
                    onClick={() => setViewOrder(order)}
                    className="text-xs text-kashish hover:underline"
                  >
                    View
                  </button>
                  <button
                    onClick={() => { setSelectedOrder(order); setStatusUpdate(order.orderStatus); setTrackingNumber(order.trackingNumber || ''); }}
                    className="text-xs text-terracotta hover:underline"
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Order Details Modal */}
      {viewOrder && (
        <div className="fixed inset-0 bg-kashish/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-8">
            <div className="flex justify-between items-center p-6 border-b border-sand/20">
              <div>
                <h2 className="font-display text-xl text-kashish">{viewOrder.orderNumber}</h2>
                <p className="text-sm text-sand">{new Date(viewOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(viewOrder.orderStatus)}`}>{viewOrder.orderStatus}</span>
                <button onClick={() => setViewOrder(null)} className="text-sand hover:text-terracotta text-2xl">&times;</button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-cream/30 rounded-lg p-4">
                  <p className="text-xs font-label text-sand uppercase mb-2">Customer</p>
                  <p className="font-medium text-kashish">{viewOrder.user?.name}</p>
                  <p className="text-sm text-sand">{viewOrder.user?.email}</p>
                </div>
                <div className="bg-cream/30 rounded-lg p-4">
                  <p className="text-xs font-label text-sand uppercase mb-2">Payment</p>
                  <p className={`font-medium ${viewOrder.paymentInfo?.status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                    {viewOrder.paymentInfo?.status === 'paid' ? 'Paid Online' : 'Cash on Delivery'}
                  </p>
                  {viewOrder.trackingNumber && <p className="text-sm text-sand mt-1">Tracking: {viewOrder.trackingNumber}</p>}
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <p className="text-xs font-label text-sand uppercase mb-2">Shipping Address</p>
                <div className="bg-cream/30 rounded-lg p-4 text-sm text-kashish leading-relaxed">
                  <p className="font-medium">{viewOrder.shippingAddress?.name}</p>
                  <p>{viewOrder.shippingAddress?.street}</p>
                  <p>{viewOrder.shippingAddress?.city}, {viewOrder.shippingAddress?.state} - {viewOrder.shippingAddress?.pincode}</p>
                  <p>{viewOrder.shippingAddress?.country}</p>
                  <p className="mt-1">📞 {viewOrder.shippingAddress?.phone}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <p className="text-xs font-label text-sand uppercase mb-2">Items Ordered</p>
                <div className="space-y-3">
                  {viewOrder.orderItems?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-cream/30 rounded-lg">
                      {item.image && <img src={item.image} alt={item.name} className="w-12 h-16 object-cover rounded" />}
                      <div className="flex-1">
                        <p className="font-medium text-kashish text-sm">{item.name}</p>
                        <p className="text-xs text-sand">Size: {item.size} | Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-kashish text-sm">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-sand/20 pt-4 space-y-2 text-sm text-kashish">
                <div className="flex justify-between"><span>Items Total</span><span>₹{viewOrder.itemsPrice}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>{viewOrder.shippingPrice === 0 ? 'FREE' : `₹${viewOrder.shippingPrice}`}</span></div>
                <div className="flex justify-between text-sand text-xs"><span>CGST</span><span>₹{viewOrder.gstBreakdown?.cgst}</span></div>
                <div className="flex justify-between text-sand text-xs"><span>SGST</span><span>₹{viewOrder.gstBreakdown?.sgst}</span></div>
                {viewOrder.discountAmount > 0 && <div className="flex justify-between text-terracotta"><span>Discount</span><span>-₹{viewOrder.discountAmount}</span></div>}
                <div className="flex justify-between font-bold text-base border-t border-sand/20 pt-2"><span>Total</span><span className="text-terracotta">₹{viewOrder.totalPrice}</span></div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setViewOrder(null)} className="flex-1 py-2 border border-sand text-kashish rounded hover:bg-cream text-sm">Close</button>
                <button
                  onClick={() => { setSelectedOrder(viewOrder); setStatusUpdate(viewOrder.orderStatus); setTrackingNumber(viewOrder.trackingNumber || ''); setViewOrder(null); }}
                  className="flex-1 py-2 bg-kashish text-white rounded hover:bg-terracotta text-sm"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-kashish/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-xl text-kashish">Update Order</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-sand hover:text-terracotta text-2xl">&times;</button>
            </div>
            <p className="text-sm text-sand mb-1">Order Number</p>
            <p className="font-medium text-kashish mb-4">{selectedOrder.orderNumber}</p>
            <div className="mb-4">
              <label className="block text-sm font-label text-kashish mb-2">Order Status</label>
              <select value={statusUpdate} onChange={(e) => setStatusUpdate(e.target.value)} className="w-full p-3 border border-sand/30 rounded focus:outline-terracotta">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-label text-kashish mb-2">Tracking Number (optional)</label>
              <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="e.g. DTDC123456789" className="w-full p-3 border border-sand/30 rounded focus:outline-terracotta" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSelectedOrder(null)} className="flex-1 py-2 border border-sand text-kashish rounded hover:bg-cream">Cancel</button>
              <button onClick={handleStatusUpdate} disabled={updating} className="flex-1 py-2 bg-kashish text-white rounded hover:bg-terracotta disabled:opacity-50">
                {updating ? 'Updating...' : 'Update Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}