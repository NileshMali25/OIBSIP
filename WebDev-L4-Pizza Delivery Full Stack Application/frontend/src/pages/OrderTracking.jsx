import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardList, Flame, Bike, CheckCircle2, ChevronRight, FileText, ArrowLeft, Loader2, Sparkles, ChefHat } from 'lucide-react';
import { socket } from '../services/socket';
import api from '../services/api';
import toast from 'react-hot-toast';

const STATUS_FLOW = ['Order Received', 'Preparing', 'Baking', 'Out for Delivery', 'Delivered'];

const STEP_ICONS = {
  'Order Received': ClipboardList,
  'Preparing': ChefHat,
  'Baking': Flame,
  'Out for Delivery': Bike,
  'Delivered': CheckCircle2
};

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrderDetails();
    
    // Connect socket on mount
    socket.connect();
    
    // Join order room
    socket.emit('join', id);

    // Listen to real-time status changes
    socket.on('orderStatusChanged', (data) => {
      console.log('[SOCKET] - Received status update:', data);
      if (data.orderId === id) {
        setOrder(prev => prev ? { ...prev, orderStatus: data.status } : null);
        toast(`Order status updated to: ${data.status} 🍕`, { icon: '🔔' });
      }
    });

    return () => {
      socket.off('orderStatusChanged');
      socket.disconnect();
    };
  }, [id]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.data.order);
    } catch (err) {
      toast.error('Failed to load tracking details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    setInvoiceLoading(true);
    try {
      const res = await api.get(`/orders/${id}/invoice`, { responseType: 'blob' });
      const file = new Blob([res.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = fileURL;
      link.download = `invoice_${id}.pdf`;
      link.click();
      toast.success('Invoice downloaded successfully! 📄');
    } catch (err) {
      toast.error('Failed to download invoice PDF.');
    } finally {
      setInvoiceLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-red" size={36} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-20 text-center p-8 glass-card">
        <span className="text-5xl">🤷</span>
        <h3 className="text-xl font-bold text-gray-700 dark:text-zinc-400 mt-4">Order Not Found</h3>
        <button onClick={() => navigate('/')} className="btn-primary mt-6">Go to Menu</button>
      </div>
    );
  }

  const currentStatusIndex = STATUS_FLOW.indexOf(order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back to Home / Profile */}
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 dark:text-zinc-400 hover:text-brand-red mb-6 cursor-pointer"
      >
        <ArrowLeft size={16} /> Back to Menu
      </button>

      <div className="bg-white dark:bg-zinc-900/40 rounded-2xl border border-gray-150/70 dark:border-zinc-800/60 p-6 sm:p-8 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 dark:border-zinc-850 pb-5 mb-6 gap-4">
          <div>
            <span className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Tracking Code</span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-800 dark:text-zinc-100 uppercase">
              #{order._id.substring(18)}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Invoice button */}
            <button
              onClick={handleDownloadInvoice}
              disabled={invoiceLoading}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300 font-semibold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {invoiceLoading ? <Loader2 className="animate-spin" size={14} /> : <FileText size={14} />}
              Invoice PDF
            </button>

            <span className="px-3.5 py-1.5 rounded-full bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 text-xs font-bold border border-green-200 dark:border-green-800 shadow-sm">
              {order.paymentStatus === 'Paid' ? 'Paid Securely' : 'Pending Payment'}
            </span>
          </div>
        </div>

        {/* Visual Steps tracking */}
        <div className="space-y-8 relative">
          {/* Vertical Connecting Line */}
          <div className="absolute top-4 bottom-4 left-6.5 w-0.5 bg-gray-200 dark:bg-zinc-800 z-0"></div>

          {STATUS_FLOW.map((status, index) => {
            const Icon = STEP_ICONS[status] || ClipboardList;
            const isCompleted = index < currentStatusIndex;
            const isActive = index === currentStatusIndex;
            const isPending = index > currentStatusIndex;

            return (
              <motion.div 
                layout
                key={status}
                className="flex items-start gap-4 relative z-10"
              >
                {/* Icon wrapper */}
                <div className={`w-13 h-13 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-brand-red border-brand-red text-white shadow-lg shadow-brand-red/10' 
                    : isActive 
                      ? 'bg-white dark:bg-zinc-950 border-brand-red text-brand-red scale-110 shadow-lg shadow-brand-red/10 animate-pulse' 
                      : 'bg-white dark:bg-zinc-950 border-gray-200 dark:border-zinc-800 text-gray-400'
                }`}>
                  <Icon size={20} className={isActive ? 'animate-float' : ''} />
                </div>

                {/* Text details */}
                <div className="pt-2">
                  <h4 className={`font-bold text-sm sm:text-base ${
                    isActive 
                      ? 'text-brand-red' 
                      : isPending 
                        ? 'text-gray-400 dark:text-zinc-600' 
                        : 'text-gray-800 dark:text-zinc-300'
                  }`}>
                    {status}
                  </h4>
                  <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
                    {status === 'Order Received' && 'Order validated and placed in queue'}
                    {status === 'Preparing' && 'Custom details loaded, toppings allocated'}
                    {status === 'Baking' && 'Piping hot, firing up coal chamber'}
                    {status === 'Out for Delivery' && 'Rider transit, direct delivery route'}
                    {status === 'Delivered' && 'Pizzeria transaction complete! Enjoy'}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Cart Items Details in order page */}
      <div className="bg-white dark:bg-zinc-900/40 rounded-2xl border border-gray-150/70 dark:border-zinc-800/60 p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 dark:text-zinc-50 border-b border-gray-100 dark:border-zinc-850 pb-2 mb-4">
          Order Items summary
        </h3>
        <div className="space-y-4">
          {order.items.map((item, idx) => {
            const pizzaName = item.pizza ? item.pizza.name : 'Custom Built Pizza';
            const pizzaDesc = item.pizza ? item.pizza.description : 
              `Crust: ${item.customPizza.base}, Sauce: ${item.customPizza.sauce}, Cheese: ${item.customPizza.cheese}, Veg: ${item.customPizza.vegetables.join(', ')}`;
            return (
              <div key={idx} className="flex justify-between items-start text-sm">
                <div>
                  <span className="font-bold text-gray-800 dark:text-zinc-200 block">{pizzaName}</span>
                  <span className="text-xs text-gray-400 dark:text-zinc-500 line-clamp-1 max-w-[280px] sm:max-w-lg mt-0.5">{pizzaDesc}</span>
                </div>
                <span className="font-semibold text-gray-700 dark:text-zinc-300 text-right">
                  {item.quantity} x ₹{item.price}
                </span>
              </div>
            );
          })}
          
          <div className="border-t border-gray-100 dark:border-zinc-850 pt-4 flex justify-between items-center text-sm font-bold text-gray-800 dark:text-zinc-300">
            <span>Bill Amount:</span>
            <span className="text-lg font-black text-brand-red">₹{order.amount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
