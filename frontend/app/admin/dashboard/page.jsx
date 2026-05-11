'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      const userStr = localStorage.getItem('attyer_user');
      const token = userStr ? JSON.parse(userStr).token : null;
      if (!token) return;
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/dashboard`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
      setError('Failed to load dashboard data. Please check backend connection.');
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleUpdateStock = async (product, size) => {
    const newStock = window.prompt(`Enter NEW total stock amount for Size ${size}:`);
    if (newStock === null || newStock.trim() === '' || isNaN(newStock)) return;
    
    const updatedVariants = product.variants.map(v => 
      v.size === size ? { ...v, stock: Number(newStock) } : v
    );

    try {
      const userStr = localStorage.getItem('attyer_user');
      const token = userStr ? JSON.parse(userStr).token : null;
      if (!token) return;
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products/${product._id}`, 
        { variants: updatedVariants }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Stock updated successfully!');
      fetchStats(); // Refresh dashboard
    } catch (err) {
      console.error(err);
      alert('Failed to update stock. Check console for details.');
    }
  };

  if (error) return <p className="text-red-500 p-8">{error}</p>;
  if (!stats) return <p className="text-sand p-8">Loading dashboard...</p>;

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-kashish">Dashboard Overview</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded border border-sand/30 shadow-sm border-l-4 border-l-terracotta">
          <p className="text-sand text-sm font-label uppercase">Total Revenue</p>
          <p className="text-3xl font-display text-kashish mt-2">₹{stats.totalRevenue}</p>
        </div>
        <div className="bg-white p-6 rounded border border-sand/30 shadow-sm border-l-4 border-l-sage">
          <p className="text-sand text-sm font-label uppercase">Total Orders</p>
          <p className="text-3xl font-display text-kashish mt-2">{stats.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded border border-sand/30 shadow-sm border-l-4 border-l-ochre">
          <p className="text-sand text-sm font-label uppercase">Total Products</p>
          <p className="text-3xl font-display text-kashish mt-2">{stats.totalProducts}</p>
        </div>
        <div className="bg-white p-6 rounded border border-sand/30 shadow-sm border-l-4 border-l-kashish">
          <p className="text-sand text-sm font-label uppercase">Total Users</p>
          <p className="text-3xl font-display text-kashish mt-2">{stats.totalUsers}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders Table */}
        <div className="bg-white p-6 rounded border border-sand/30 shadow-sm">
          <h2 className="font-label text-lg mb-6 text-kashish">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream/50 text-sand border-b border-sand/20">
                <tr>
                  <th className="p-3 font-normal">Order ID</th>
                  <th className="p-3 font-normal">Customer</th>
                  <th className="p-3 font-normal">Amount</th>
                  <th className="p-3 font-normal">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/10 text-kashish">
                {stats.recentOrders?.length > 0 ? stats.recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-cream/20 transition-colors">
                    <td className="p-3">#{order._id.substring(0,8)}</td>
                    <td className="p-3">{order.user?.name || 'Guest'}</td>
                    <td className="p-3">₹{order.totalPrice}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' : 
                        order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' : 
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="p-3 text-center text-sand">No recent orders</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded border border-sand/30 shadow-sm">
          <h2 className="font-label text-lg mb-6 text-terracotta flex items-center gap-2">
            Low Stock Alerts
          </h2>
          <div className="space-y-4">
            {stats.lowStockProducts?.length > 0 ? stats.lowStockProducts.map((product) => {
              const lowVariants = product.variants?.filter(v => v.stock <= 5) || [];
              if (lowVariants.length === 0) return null;
              return (
                <div key={product._id} className="p-4 border border-red-100 bg-red-50/30 rounded flex flex-col gap-2">
                  <p className="font-medium text-kashish">{product.name}</p>
                  {lowVariants.map(v => (
                    <div key={v.size} className="flex justify-between items-center bg-white p-2 rounded border border-red-100/50">
                      <p className="text-sm text-terracotta">Size {v.size}: {v.stock} left</p>
                      <button onClick={() => handleUpdateStock(product, v.size)} className="text-xs bg-white border border-sand/30 px-3 py-1 rounded hover:bg-cream transition-colors text-kashish">
                        Update
                      </button>
                    </div>
                  ))}
                </div>
              )
            }) : (
              <p className="text-sm text-sand text-center py-4">Inventory levels are healthy.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
