import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ShoppingBag, AlertTriangle, Sparkles, TrendingUp, Calendar, Loader2, ArrowRight } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/analytics/stats');
      setMetrics(res.data.data.metrics);
      setRecentOrders(res.data.data.recentOrders);
    } catch (err) {
      toast.error('Failed to load admin analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-red" size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-zinc-50 tracking-tight">Admin Overview</h1>
        <p className="text-sm text-gray-400 dark:text-zinc-500 mt-1">Real-time statistics and pizzeria activity metrics</p>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="analytics-card">
          <div className="flex justify-between items-start">
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Revenue</span>
              <span className="text-3xl font-black text-gray-800 dark:text-zinc-100">₹{metrics?.revenue || 0}</span>
            </div>
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 text-green-500 border border-green-200 dark:border-green-800">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs text-green-500 font-bold">
            <TrendingUp size={14} /> +12.5% increase this month
          </div>
        </div>

        {/* Total Orders */}
        <div className="analytics-card">
          <div className="flex justify-between items-start">
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Orders</span>
              <span className="text-3xl font-black text-gray-800 dark:text-zinc-100">{metrics?.ordersCount || 0}</span>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-500 border border-blue-200 dark:border-blue-800">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-400 dark:text-zinc-500 font-semibold">
            All system order listings
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="analytics-card">
          <div className="flex justify-between items-start">
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Stock Warnings</span>
              <span className="text-3xl font-black text-gray-800 dark:text-zinc-100">{metrics?.lowStockCount || 0}</span>
            </div>
            <div className={`p-3 rounded-lg border ${
              (metrics?.lowStockCount || 0) > 0 
                ? 'bg-red-50 dark:bg-red-950/20 text-red-500 border-red-200 dark:border-red-800 animate-pulse' 
                : 'bg-gray-50 dark:bg-zinc-800 text-gray-400 border-gray-250 dark:border-zinc-700'
            }`}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-400 dark:text-zinc-500 font-semibold">
            Ingredients near safety thresholds
          </div>
        </div>

        {/* Custom Pizza Orders */}
        <div className="analytics-card">
          <div className="flex justify-between items-start">
            <div>
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Custom Orders</span>
              <span className="text-3xl font-black text-gray-800 dark:text-zinc-100">{metrics?.customPizzasCount || 0}</span>
            </div>
            <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-brand-orange border border-orange-200 dark:border-orange-850">
              <Sparkles size={20} />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-400 dark:text-zinc-500 font-semibold">
            Custom-built wizard selections
          </div>
        </div>
      </div>

      {/* Recent Orders List */}
      <div className="bg-white dark:bg-zinc-900/40 rounded-xl border border-gray-150/70 dark:border-zinc-800/60 p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-850 pb-4 mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-50">Recent System Orders</h2>
          <button 
            onClick={() => navigate('/admin/orders')}
            className="text-xs font-semibold text-brand-red hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            Manage All Orders <ArrowRight size={12} />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-zinc-500">No recent orders registered in the system.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-zinc-850 text-gray-400 dark:text-zinc-500 font-bold">
                  <th className="pb-3 font-semibold">Order ID</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-zinc-850/50">
                {recentOrders.map((order) => (
                  <tr 
                    key={order._id}
                    onClick={() => navigate(`/admin/orders`)}
                    className="hover:bg-gray-50/50 dark:hover:bg-zinc-850/20 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 font-bold uppercase text-gray-600 dark:text-zinc-400 text-xs">
                      #{order._id.substring(18)}
                    </td>
                    <td className="py-3.5 text-gray-500 dark:text-zinc-500 text-xs">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 font-semibold text-gray-700 dark:text-zinc-300">
                      {order.user?.name || 'Guest User'}
                    </td>
                    <td className="py-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm ${
                        order.orderStatus === 'Delivered' 
                          ? 'bg-green-50 dark:bg-green-950/20 text-green-600 border-green-200 dark:border-green-800' 
                          : 'bg-orange-50 dark:bg-orange-950/20 text-brand-orange border-orange-200 dark:border-orange-800'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3.5 font-bold text-gray-900 dark:text-zinc-200 text-right">
                      ₹{order.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
