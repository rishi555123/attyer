'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('attyer_user'))?.token;
        if (!token) {
          setError('Please login to view orders');
          setLoading(false);
          return;
        }
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/orders/myorders`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setOrders(res.data.data || []);
      } catch (err) {
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-12 min-h-[60vh] flex items-center justify-center">
      <p className="text-kashish">Loading orders...</p>
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto px-4 py-12 min-h-[60vh]">
      <p className="text-red-500">{error}</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 min-h-[60vh]">
      <h1 className="font-display text-4xl text-kashish mb-8">Order History</h1>

      {orders.length === 0 ? (
        <div className="bg-ivory p-8 text-center rounded border border-sand/20 text-kashish">
          <p className="mb-4">No orders found.</p>
          <Link href="/shop" className="text-terracotta underline">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="bg-white border border-sand/20 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-label text-sm text-sand">Order Number</p>
                  <p className="font-medium text-kashish">{order.orderNumber}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                  order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-600' :
                  order.orderStatus === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {order.orderStatus}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {order.orderItems.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm text-kashish">
                    <span>{item.name} × {item.quantity} ({item.size})</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center border-t border-sand/20 pt-4">
                <div className="text-sm text-sand">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium text-kashish">₹{order.totalPrice}</span>
                  <Link href={`/orders/${order._id}`} className="text-sm text-terracotta underline">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}