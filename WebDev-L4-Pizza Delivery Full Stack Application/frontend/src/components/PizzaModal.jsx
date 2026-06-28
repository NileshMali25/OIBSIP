import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import toast from 'react-hot-toast';

const PizzaModal = ({ pizza, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch();

  if (!pizza) return null;

  const handleAddToCart = () => {
    dispatch(addToCart({ pizza, quantity }));
    toast.success(`${quantity}x ${pizza.name} added to cart! 🛒`);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-100 dark:border-zinc-800 relative z-10 flex flex-col md:flex-row"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-700 text-gray-500 dark:text-zinc-300 z-20 cursor-pointer shadow"
          >
            <X size={18} />
          </button>

          {/* Pizza Image */}
          <div className="md:w-1/2 relative h-64 md:h-auto bg-gray-50 dark:bg-zinc-950">
            <img
              src={pizza.image}
              alt={pizza.name}
              className="w-full h-full object-cover"
            />
            <span className={`absolute bottom-4 left-4 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow ${
              pizza.category === 'Veg' ? 'bg-green-500' : pizza.category === 'Non-Veg' ? 'bg-red-500' : 'bg-blue-500'
            }`}>
              {pizza.category}
            </span>
          </div>

          {/* Pizza Details */}
          <div className="md:w-1/2 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-zinc-50 mb-2">{pizza.name}</h3>
              <p className="text-gray-500 dark:text-zinc-400 text-sm mb-4 leading-relaxed">{pizza.description}</p>

              {/* Ingredients */}
              {pizza.ingredients && pizza.ingredients.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-2">Ingredients</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {pizza.ingredients.map((ing, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 capitalize font-medium"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Price and Cart controls */}
            <div className="border-t border-gray-100 dark:border-zinc-800 pt-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-gray-500 dark:text-zinc-400">Total Price</span>
                <span className="text-2xl font-black text-brand-red">₹{(pizza.basePrice * quantity).toFixed(2)}</span>
              </div>

              <div className="flex items-center gap-3">
                {/* Quantity adjuster */}
                <div className="flex items-center border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2.5 bg-gray-50 dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 font-bold text-gray-800 dark:text-zinc-200">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2.5 bg-gray-50 dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Add Button */}
                <button
                  onClick={handleAddToCart}
                  className="flex-grow btn-primary flex items-center justify-center gap-2 py-3"
                >
                  <ShoppingBag size={18} /> Add to Cart
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PizzaModal;
