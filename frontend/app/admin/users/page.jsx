'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userStr = localStorage.getItem('attyer_user');
        const token = userStr ? JSON.parse(userStr).token : null;
        if (!token) return;
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/users`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setUsers(res.data.data);
      } catch (err) {
        console.error('Failed to fetch users', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl text-kashish mb-8">Users Management</h1>
      <div className="bg-white rounded border border-sand/30 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream text-kashish font-label border-b border-sand/30">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand/10 text-kashish">
            {loading ? (
              <tr>
                <td className="p-4 text-center text-sand" colSpan="4">Loading users...</td>
              </tr>
            ) : users.length > 0 ? (
              users.map(u => (
                <tr key={u._id} className="hover:bg-cream/20">
                  <td className="p-4">{u.name}</td>
                  <td className="p-4">{u.email}</td>
                  <td className="p-4 capitalize">{u.role}</td>
                  <td className="p-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-4 text-center text-sand" colSpan="4">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
