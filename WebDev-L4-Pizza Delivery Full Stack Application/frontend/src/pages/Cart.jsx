import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Plus, Minus, Ticket, ShoppingBag, ArrowRight } from 'lucide-react';
import { increaseQuantity, decreaseQuantity, removeFromCart, applyCoupon, removeCoupon } from '../redux/cartSlice';
import toast from 'react-hot-toast';

const Cart = () => {
  const cart = useSelector((state) => state.cart);
  const [coupon, setCoupon] = useState(cart.couponCode || '');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleApplyCoupon = () => {
    if (coupon.trim() === 'PIZZA20') {
      dispatch(applyCoupon('PIZZA20'));
      toast.success('Coupon applied! You got 20% off 🎉');
    } else {
      toast.error('Invalid coupon code! Try PIZZA20');
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    setCoupon('');
    toast.success('Coupon removed.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-zinc-50 mb-8">Shopping Cart</h2>

      {cart.items.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900/20 rounded-3xl border border-gray-100 dark:border-zinc-800/50">
          <span className="text-6xl">🛒</span>
          <h3 className="text-xl font-bold text-gray-700 dark:text-zinc-400 mt-4">Your Cart is Empty</h3>
          <p className="text-sm text-gray-400 dark:text-zinc-500 mt-1.5 mb-8">Looks like you haven't added any pizzas to your cart yet.</p>
          <Link to="/" className="btn-primary py-3 px-6">Browse Pizza Menu</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => {
              const pizzaName = item.pizza ? item.pizza.name : 'Custom Pizza';
              const pizzaImage = item.pizza ? item.pizza.image : 'https://res.cloudinary.com/default/image/upload/v1600000000/default-pizza.png';
              const details = item.customPizza ? 
                `Crust: ${item.customPizza.base}, Sauce: ${item.customPizza.sauce}, Cheese: ${item.customPizza.cheese}, Veggies: ${item.customPizza.vegetables.join(', ')}` : 
                '';

              return (
                <div 
                  key={item.uniqueId}
                  className="bg-white dark:bg-zinc-900/40 rounded-xl border border-gray-150/70 dark:border-zinc-800/60 p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-sm"
                >
                  {/* Left Column: Image & Details */}
                  <div className="flex items-center gap-4">
                    <img 
                      src={pizzaImage} 
                      alt={pizzaName} 
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-100 dark:border-zinc-800"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-zinc-50 text-base sm:text-lg">{pizzaName}</h4>
                      {details && <p className="text-xs text-gray-400 dark:text-zinc-500 leading-relaxed mt-1">{details}</p>}
                      <span className="text-sm font-black text-brand-red mt-2 block">₹{item.price.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Right Column: Qty and Remove */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-gray-100 dark:border-zinc-800/50 pt-3 sm:pt-0">
                    <div className="flex items-center border border-gray-200 dark:border-zinc-850 rounded-lg overflow-hidden bg-gray-50/50 dark:bg-zinc-950/20">
                      <button
                        onClick={() => dispatch(decreaseQuantity(item.uniqueId))}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-400"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 text-sm font-bold text-gray-800 dark:text-zinc-200">{item.quantity}</span>
                      <button
                        onClick={() => dispatch(increaseQuantity(item.uniqueId))}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-400"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-black text-base dark:text-zinc-100 text-right w-16">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => dispatch(removeFromCart(item.uniqueId))}
                        className="p-2 rounded-lg text-gray-400 hover:text-brand-red hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                        title="Remove Item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart summary & Checkout panel */}
          <div className="space-y-6">
            {/* Promo Code section */}
            <div className="bg-white dark:bg-zinc-900/40 rounded-xl border border-gray-150/70 dark:border-zinc-800/60 p-5 shadow-sm">
              <label className="custom-label flex items-center gap-1.5 font-bold mb-2">
                <Ticket size={16} /> Promo Coupon Code
              </label>
              
              {cart.couponCode ? (
                <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-400 font-semibold">
                  <span>Applied: {cart.couponCode}</span>
                  <button 
                    onClick={handleRemoveCoupon}
                    className="text-xs text-red-500 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (PIZZA20)"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    className="custom-input py-2 text-sm flex-grow uppercase"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="btn-secondary py-2 text-xs flex-shrink-0"
                  >
                    Apply
                  </button>
                </div>
              )}
              {!cart.couponCode && (
                <p className="text-[10px] text-gray-400 mt-2 font-medium">Use coupon <strong>PIZZA20</strong> to get 20% discount on order subtotal!</p>
              )}
            </div>

            {/* Calculations break down */}
            <div className="bg-white dark:bg-zinc-900/40 rounded-xl border border-gray-150/70 dark:border-zinc-800/60 p-5 space-y-3.5 shadow-sm text-sm">
              <h3 className="font-bold text-gray-900 dark:text-zinc-50 border-b border-gray-100 dark:border-zinc-850 pb-2 mb-2">Checkout Bill</h3>
              
              <div className="flex justify-between items-center text-gray-600 dark:text-zinc-400">
                <span>Subtotal:</span>
                <span className="font-semibold text-gray-800 dark:text-zinc-200">₹{cart.subtotal.toFixed(2)}</span>
              </div>

              {cart.discountAmount > 0 && (
                <div className="flex justify-between items-center text-brand-red font-semibold">
                  <span>Coupon Discount (20%):</span>
                  <span>-₹{cart.discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-gray-600 dark:text-zinc-400">
                <span>GST Tax (5%):</span>
                <span className="font-semibold text-gray-800 dark:text-zinc-200">₹{cart.tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-gray-600 dark:text-zinc-400">
                <span>Delivery Charge:</span>
                <span className="font-semibold text-gray-800 dark:text-zinc-200">
                  {cart.deliveryCharge === 0 ? 'FREE' : `₹${cart.deliveryCharge.toFixed(2)}`}
                </span>
              </div>
              {cart.subtotal < 500 && cart.subtotal > 0 && (
                <p className="text-[10px] text-orange-500 font-semibold">Add ₹{(500 - cart.subtotal).toFixed(2)} more to unlock FREE Delivery!</p>
              )}

              <div className="border-t border-gray-100 dark:border-zinc-800/80 pt-4 mt-2">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-bold text-gray-900 dark:text-zinc-50 text-base">Grand Total:</span>
                  <span className="text-2xl font-black text-brand-red">₹{cart.amount.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-3"
                >
                  Proceed to Checkout <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
