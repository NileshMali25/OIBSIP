import React, { useState, useEffect } from 'react';
import { Loader2, ShoppingBag, Eye, Calendar, FileText } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['Order Received', 'Preparing', 'In Kitchen', 'Out For Delivery', 'Delivered'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders?limit=100');
      setOrders(res.data.data.orders);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      toast.loading('Updating status...', { id: 'status-toast' });
      await api.patch(`/orders/${orderId}/status`, { orderStatus: newStatus });
      
      // Update local state
      setOrders(orders.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
      toast.success(`Order status updated to: ${newStatus}! 🍕`, { id: 'status-toast' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status.', { id: 'status-toast' });
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
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-zinc-50 tracking-tight">Manage System Orders</h1>
        <p className="text-sm text-gray-400 dark:text-zinc-500 mt-1">Advance tracking levels to dispatch live updates to customer screens</p>
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-brand-red" size={36} />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900/20 border border-gray-100 rounded-2xl">
          <h4 className="text-lg font-bold text-gray-700">No Orders Placed</h4>
          <p className="text-xs text-gray-400 mt-1">Check back when customers check out from the front-end cart.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900/40 rounded-xl border border-gray-150/70 dark:border-zinc-800/60 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-zinc-850 bg-gray-50/50 dark:bg-zinc-900/30 text-gray-400 dark:text-zinc-500 font-bold">
                <th className="p-4 font-semibold">Order ID</th>
                <th className="p-4 font-semibold">Customer Details</th>
                <th className="p-4 font-semibold">Purchased Items</th>
                <th className="p-4 font-semibold">Grand Total</th>
                <th className="p-4 font-semibold">Set Status</th>
                <th className="p-4 font-semibold text-center">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-850/50">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50/30 dark:hover:bg-zinc-850/10 transition-colors">
                  {/* Order ID */}
                  <td className="p-4 font-bold uppercase text-gray-600 dark:text-zinc-400 text-xs">
                    #{order._id.substring(18)}
                  </td>
                  
                  {/* Customer Details */}
                  <td className="p-4">
                    <span className="font-bold text-gray-800 dark:text-zinc-200 block">{order.user?.name || 'Guest User'}</span>
                    <span className="text-[10px] text-gray-400 block">{order.user?.phone || 'No phone'}</span>
                    <span className="text-[10px] text-gray-400 block max-w-[150px] truncate">{order.address?.street}, {order.address?.city}</span>
                  </td>

                  {/* Items purchased */}
                  <td className="p-4">
                    <div className="space-y-1">
                      {order.items.map((item, idx) => {
                        const pizzaName = item.pizza ? item.pizza.name : 'Custom Pizza';
                        return (
                          <div key={idx} className="text-xs text-gray-500 dark:text-zinc-400">
                            <strong>{pizzaName}</strong> <span className="text-gray-400">x{item.quantity}</span>
                          </div>
                        );
                      })}
                    </div>
                  </td>

                  {/* Grand total */}
                  <td className="p-4 font-bold text-brand-red text-base">
                    ₹{order.amount.toFixed(2)}
                  </td>

                  {/* Status Dropdown selector */}
                  <td className="p-4">
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-brand-red"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Invoice action */}
                  <td className="p-4 text-center">
                    <button
                      onClick={(e) => handleDownloadInvoice(order._id, e)}
                      className="p-2 text-gray-400 hover:text-brand-red rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all cursor-pointer inline-flex items-center gap-1 text-xs font-bold"
                      title="Download Invoice PDF"
                    >
                      <FileText size={16} /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
