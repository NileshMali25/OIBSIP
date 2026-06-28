import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, ShoppingBag, Calendar, Eye, FileText, Loader2, ArrowRight } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const fetchUserOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data.data.orders);
    } catch (err) {
      toast.error('Failed to load past orders');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (orderId, e) => {
    e.stopPropagation();
    try {
      toast.loading('Generating invoice...', { id: 'invoice-toast' });
      const res = await api.get(`/orders/${orderId}/invoice`, { responseType: 'blob' });
      const file = new Blob([res.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileURL;
      link.download = `invoice_${orderId}.pdf`;
      link.click();
      toast.success('Invoice downloaded! 📄', { id: 'invoice-toast' });
    } catch (err) {
      toast.error('Failed to download invoice PDF.', { id: 'invoice-toast' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Grid: User Profile Cards + Orders List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Card */}
        <div className="bg-white dark:bg-zinc-900/40 rounded-xl border border-gray-150/70 dark:border-zinc-800/60 p-6 shadow-sm h-fit">
          <div className="text-center mb-6 border-b border-gray-100 dark:border-zinc-850 pb-6">
            <img 
              src={user?.profileImage} 
              alt="Profile" 
              className="w-24 h-24 rounded-full border border-gray-250 dark:border-zinc-700 object-cover mx-auto mb-4"
            />
            <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-50">{user?.name}</h3>
            <span className="px-3 py-1 rounded bg-gray-100 dark:bg-zinc-800 text-[10px] uppercase font-bold text-gray-500 tracking-wider mt-1.5 inline-block">
              {user?.role} Account
            </span>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3 text-gray-600 dark:text-zinc-400">
              <Mail size={16} />
              <span className="truncate">{user?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600 dark:text-zinc-400">
              <Phone size={16} />
              <span>{user?.phone}</span>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-zinc-50 flex items-center gap-2">
            <ShoppingBag className="text-brand-red" size={24} /> Order History ({orders.length})
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-brand-red" size={32} />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900/20 rounded-2xl border border-gray-100 dark:border-zinc-800/50">
              <span className="text-4xl">🍕</span>
              <h4 className="text-lg font-bold text-gray-700 dark:text-zinc-400 mt-3">No Orders Found</h4>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1 mb-6">You haven't ordered any pizzas yet.</p>
              <button onClick={() => navigate('/')} className="btn-primary py-2 px-5 text-sm">Order Now</button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div 
                  key={order._id}
                  onClick={() => navigate(`/order-tracking/${order._id}`)}
                  className="bg-white dark:bg-zinc-900/40 rounded-xl border border-gray-150/70 dark:border-zinc-800/60 p-5 shadow-sm hover:shadow-md hover:border-gray-250 dark:hover:border-zinc-700 transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">#{order._id.substring(18)}</span>
                      <span className="text-xs text-gray-300 dark:text-zinc-600">•</span>
                      <span className="text-xs text-gray-500 dark:text-zinc-400 flex items-center gap-1">
                        <Calendar size={12} /> {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200 line-clamp-1 max-w-[280px] sm:max-w-md">
                      {order.items.map(item => item.pizza ? item.pizza.name : 'Custom Pizza').join(', ')}
                    </p>

                    <div className="flex items-center gap-3 mt-3">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-sm ${
                        order.orderStatus === 'Delivered' 
                          ? 'bg-green-50 dark:bg-green-950/20 text-green-600 border-green-200 dark:border-green-800' 
                          : 'bg-orange-50 dark:bg-orange-950/20 text-brand-orange border-orange-200 dark:border-orange-800 animate-pulse'
                      }`}>
                        {order.orderStatus}
                      </span>
                      <span className="text-sm font-extrabold text-brand-red">₹{order.amount}</span>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center gap-3 w-full sm:w-auto border-t sm:border-t-0 border-gray-100 dark:border-zinc-850 pt-3 sm:pt-0 justify-between sm:justify-end">
                    <button
                      onClick={(e) => handleDownloadInvoice(order._id, e)}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-805 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                      title="Download PDF"
                    >
                      <FileText size={12} /> Invoice
                    </button>

                    <button
                      onClick={() => navigate(`/order-tracking/${order._id}`)}
                      className="btn-secondary py-1.5 px-3.5 text-xs flex items-center gap-1 font-bold"
                    >
                      Track <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
