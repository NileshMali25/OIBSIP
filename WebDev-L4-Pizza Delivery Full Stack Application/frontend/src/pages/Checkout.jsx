import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CreditCard, MapPin, Loader2, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { clearCart } from '../redux/cartSlice';
import api from '../services/api';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

const Checkout = () => {
  const cart = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      street: user?.addresses?.find(a => a.isDefault)?.street || '',
      city: user?.addresses?.find(a => a.isDefault)?.city || '',
      state: user?.addresses?.find(a => a.isDefault)?.state || '',
      zip: user?.addresses?.find(a => a.isDefault)?.zip || ''
    }
  });

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockOrderDetails, setMockOrderDetails] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart.items.length, navigate]);

  // Load Razorpay Script helper
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async (addressData) => {
    setPaymentLoading(true);
    try {
      // 1. Create order on backend (checkout session)
      const res = await api.post('/orders', {
        items: cart.items.map(i => ({
          pizza: i.pizza?._id || null,
          customPizza: i.customPizza || null,
          quantity: i.quantity,
          price: i.price
        })),
        address: addressData,
        couponCode: cart.couponCode
      });

      const { isMock, data } = res.data;

      // 2. Handle Mock Mode fallback
      if (isMock) {
        setMockOrderDetails({
          orderId: data.orderId,
          razorpayOrderId: data.razorpayOrderId,
          amount: data.amount
        });
        setShowMockModal(true);
        setPaymentLoading(false);
        return;
      }

      // 3. Load Razorpay and process payment
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load Razorpay Payment Gateway. Check your internet connection.');
        setPaymentLoading(false);
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amount * 100, // paise
        currency: 'INR',
        name: 'PizzaGo Inc.',
        description: 'Pizzeria Order Checkout Payment',
        order_id: data.razorpayOrderId,
        handler: async (response) => {
          try {
            // Verify payment signature
            const verifyRes = await api.post('/orders/verify', {
              orderId: data.orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });

            if (verifyRes.data.status === 'success') {
              // Confetti burst
              confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 }
              });

              toast.success('Payment successful! Pizza is on the way 🍕');
              dispatch(clearCart());
              navigate(`/order-tracking/${data.orderId}`);
            }
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment signature verification failed.');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone
        },
        theme: {
          color: '#e74c3c'
        },
        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
            toast.error('Payment cancelled by user.');
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
      setPaymentLoading(false);
    }
  };

  const handleMockPaymentSuccess = async () => {
    setPaymentLoading(true);
    try {
      const verifyRes = await api.post('/orders/verify', {
        orderId: mockOrderDetails.orderId,
        razorpayPaymentId: `pay_mock_${Date.now()}`,
        razorpaySignature: 'mock_signature'
      });

      if (verifyRes.data.status === 'success') {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });

        toast.success('Payment simulated successfully! (Mock Mode) 🎉');
        setShowMockModal(false);
        dispatch(clearCart());
        navigate(`/order-tracking/${mockOrderDetails.orderId}`);
      }
    } catch (err) {
      toast.error('Mock verification failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button 
        onClick={() => navigate('/cart')}
        className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 dark:text-zinc-400 hover:text-brand-red mb-6"
      >
        <ArrowLeft size={16} /> Back to Cart
      </button>

      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-zinc-50 mb-8">Checkout Checkout</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Address Entry form */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900/40 rounded-xl border border-gray-150/70 dark:border-zinc-800/60 p-6 sm:p-8 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-50 mb-6 flex items-center gap-2">
            <MapPin className="text-brand-red" size={20} /> Shipping Address Details
          </h3>

          <form onSubmit={handleSubmit(handleCheckout)} className="space-y-4">
            {/* Street */}
            <div>
              <label className="custom-label">Street Address</label>
              <input
                type="text"
                placeholder="Flat No, Apartment, Street Name"
                className={`custom-input ${errors.street ? 'border-red-500' : ''}`}
                {...register('street', { required: 'Street address is required' })}
              />
              {errors.street && <span className="text-xs text-red-500 mt-1 block">{errors.street.message}</span>}
            </div>

            {/* City & State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="custom-label">City</label>
                <input
                  type="text"
                  placeholder="New Delhi"
                  className={`custom-input ${errors.city ? 'border-red-500' : ''}`}
                  {...register('city', { required: 'City is required' })}
                />
                {errors.city && <span className="text-xs text-red-500 mt-1 block">{errors.city.message}</span>}
              </div>

              <div>
                <label className="custom-label">State</label>
                <input
                  type="text"
                  placeholder="Delhi"
                  className={`custom-input ${errors.state ? 'border-red-500' : ''}`}
                  {...register('state', { required: 'State is required' })}
                />
                {errors.state && <span className="text-xs text-red-500 mt-1 block">{errors.state.message}</span>}
              </div>
            </div>

            {/* ZIP Code */}
            <div>
              <label className="custom-label">ZIP / Postal Code</label>
              <input
                type="text"
                placeholder="110001"
                className={`custom-input ${errors.zip ? 'border-red-500' : ''}`}
                {...register('zip', { 
                  required: 'ZIP code is required',
                  pattern: { value: /^\d{6}$/, message: 'Please enter a valid 6-digit ZIP code' }
                })}
              />
              {errors.zip && <span className="text-xs text-red-500 mt-1 block">{errors.zip.message}</span>}
            </div>

            {/* Submit checkout button */}
            <button
              type="submit"
              disabled={paymentLoading}
              className="w-full btn-primary py-3.5 mt-6 flex items-center justify-center gap-2 cursor-pointer"
            >
              {paymentLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <CreditCard size={18} /> Pay with Razorpay (₹{cart.amount.toFixed(2)})
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right column: cart order review */}
        <div className="bg-white dark:bg-zinc-900/40 rounded-xl border border-gray-150/70 dark:border-zinc-800/60 p-6 shadow-sm flex flex-col justify-between h-fit">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-50 mb-4 pb-2 border-b border-gray-50 dark:border-zinc-800/50">
              Order Summary
            </h3>

            <div className="space-y-4 max-h-80 overflow-y-auto mb-6 pr-1">
              {cart.items.map((item) => {
                const pizzaName = item.pizza ? item.pizza.name : 'Custom Pizza';
                return (
                  <div key={item.uniqueId} className="flex justify-between items-center text-sm">
                    <div>
                      <span className="font-bold text-gray-800 dark:text-zinc-200 block">{pizzaName}</span>
                      <span className="text-xs text-gray-400 dark:text-zinc-500">x{item.quantity}</span>
                    </div>
                    <span className="font-semibold text-gray-600 dark:text-zinc-300">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-zinc-800/80 pt-4 space-y-3 text-sm">
            <div className="flex justify-between text-gray-500 dark:text-zinc-400">
              <span>Subtotal:</span>
              <span>₹{cart.subtotal.toFixed(2)}</span>
            </div>
            {cart.discountAmount > 0 && (
              <div className="flex justify-between text-brand-red font-semibold">
                <span>Discount:</span>
                <span>-₹{cart.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-500 dark:text-zinc-400">
              <span>GST Tax (5%):</span>
              <span>₹{cart.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500 dark:text-zinc-400">
              <span>Delivery Fee:</span>
              <span>{cart.deliveryCharge === 0 ? 'FREE' : `₹${cart.deliveryCharge.toFixed(2)}`}</span>
            </div>

            <div className="border-t border-gray-100 dark:border-zinc-800/50 pt-3 flex justify-between items-center font-bold text-gray-900 dark:text-zinc-50 text-base">
              <span>Grand Total:</span>
              <span className="text-xl font-black text-brand-red">₹{cart.amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MOCK PAYMENT DECISION MODAL */}
      <AnimatePresence>
        {showMockModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowMockModal(false)}
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl max-w-sm w-full p-6 text-center border border-gray-100 dark:border-zinc-800 relative z-10 shadow-2xl"
            >
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/10">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-50 mb-2">Simulate Razorpay</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mb-6">
                The application is running in **Razorpay Test Mock Mode**. You can bypass cryptographic gateways and simulate payment completion.
              </p>

              <div className="bg-gray-50 dark:bg-zinc-950 p-4 rounded-xl text-left text-xs mb-6 space-y-2 border border-gray-100 dark:border-zinc-850">
                <div className="flex justify-between">
                  <span className="text-gray-400">Order ID:</span>
                  <span className="font-semibold">{mockOrderDetails?.orderId.substring(18).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount Due:</span>
                  <span className="font-bold text-brand-red">₹{mockOrderDetails?.amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowMockModal(false)}
                  className="flex-1 btn-secondary py-2.5 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMockPaymentSuccess}
                  disabled={paymentLoading}
                  className="flex-1 btn-primary py-2.5 text-xs cursor-pointer bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-500/10 flex items-center justify-center gap-1.5"
                >
                  {paymentLoading ? <Loader2 className="animate-spin" size={14} /> : 'Approve Payment'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;
