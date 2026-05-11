'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => JSON.parse(localStorage.getItem('attyer_user') || '{}')?.token;

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        const returnOrders = (res.data.data || []).filter(o => ['Cancelled', 'Returned'].includes(o.orderStatus));
        setReturns(returnOrders);
      } catch (err) {
        console.error('Failed to fetch returns', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReturns();
  }, []);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setReturns(prev => prev.filter(o => o._id !== orderId));
    } catch (err) {
      alert('Failed to update return status');
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl text-kashish mb-8">Return Requests</h1>

      {loading ? (
        <div className="bg-white rounded border border-sand/30 p-8 text-center text-sand">Loading...</div>
      ) : returns.length === 0 ? (
        <div className="bg-white rounded border border-sand/30 p-8 text-center text-sand">No active return requests.</div>
      ) : (
        <div className="space-y-4">
          {returns.map(order => (
            <div key={order._id} className="bg-white border border-sand/20 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-medium text-kashish text-lg mb-2">Order ID: {order._id}</p>
                  <p className="text-sm font-bold text-kashish">Customer Details:</p>
                  <p className="text-sm text-sand">Name: {order.shippingAddress?.name || order.user?.name}</p>
                  <p className="text-sm text-sand">Email: {order.user?.email}</p>
                  <p className="text-sm text-sand">Phone: {order.shippingAddress?.phone || 'N/A'}</p>
                  <p className="text-sm text-sand mt-2">Order Date: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {order.orderStatus}
                  </span>
                  {order.user?.email && (
                    <a href={`mailto:${order.user?.email}`} className="text-xs bg-kashish text-ivory px-3 py-1.5 rounded hover:bg-terracotta transition-colors">
                      Contact Customer
                    </a>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-label text-sand mb-1">Return Reason</p>
                <p className="text-sm text-kashish">{order.returnReason || 'No reason provided'}</p>
              </div>

              <div className="mb-4 space-y-2">
                {order.orderItems.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm text-kashish">
                    <span>{item.name} × {item.quantity} ({item.size})</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-medium text-kashish border-t border-sand/20 pt-2">
                  <span>Total</span>
                  <span>₹{order.totalPrice}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleStatusUpdate(order._id, 'Delivered')}
                  className="px-4 py-2 text-sm border border-sand text-kashish rounded hover:bg-cream transition-colors"
                >
                  Reject Return
                </button>
                <button
                  onClick={() => handleStatusUpdate(order._id, 'Cancelled')}
                  className="px-4 py-2 text-sm bg-kashish text-white rounded hover:bg-terracotta transition-colors"
                >
                  Approve Return
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}