import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Package, Edit3, Loader2, X, AlertTriangle, PlusCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const AdminInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);

  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory');
      setInventory(res.data.data.items);
    } catch (err) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setValue('quantity', item.quantity);
    setValue('minimumQuantity', item.minimumQuantity);
  };

  const onSubmit = async (data) => {
    setBtnLoading(true);
    try {
      await api.patch(`/inventory/${selectedItem._id}`, {
        quantity: Number(data.quantity),
        minimumQuantity: Number(data.minimumQuantity)
      });
      toast.success('Stock levels updated!');
      setInventory(inventory.map(item => item._id === selectedItem._id ? { ...item, quantity: Number(data.quantity), minimumQuantity: Number(data.minimumQuantity) } : item));
      setSelectedItem(null);
      reset();
    } catch (err) {
      toast.error('Failed to update stock');
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-zinc-50 tracking-tight">Stock and Inventory Levels</h1>
        <p className="text-sm text-gray-400 dark:text-zinc-500 mt-1">Monitor ingredients stock and configure automatic warning thresholds</p>
      </div>

      {/* Grid listing */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-brand-red" size={36} />
        </div>
      ) : inventory.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900/20 border border-gray-100 rounded-2xl">
          <h4 className="text-lg font-bold text-gray-700">Empty Inventory</h4>
          <p className="text-xs text-gray-400 mt-1">No ingredients registered yet.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900/40 rounded-xl border border-gray-150/70 dark:border-zinc-800/60 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-zinc-850 bg-gray-50/50 dark:bg-zinc-900/30 text-gray-400 dark:text-zinc-500 font-bold">
                <th className="p-4 font-semibold">Ingredient Name</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Current Stock</th>
                <th className="p-4 font-semibold">Alert Threshold</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-center">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-850/50">
              {inventory.map((item) => {
                const isLow = item.quantity <= item.minimumQuantity;
                return (
                  <tr 
                    key={item._id} 
                    className={`transition-colors ${
                      isLow 
                        ? 'bg-red-50/10 dark:bg-red-950/5 hover:bg-red-50/20' 
                        : 'hover:bg-gray-50/30 dark:hover:bg-zinc-850/10'
                    }`}
                  >
                    <td className="p-4 font-bold text-gray-800 dark:text-zinc-200 capitalize">
                      {item.itemName}
                    </td>
                    <td className="p-4">
                      <span className="text-xs px-2.5 py-1 rounded bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 capitalize font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-gray-700 dark:text-zinc-300">
                      {item.quantity} units
                    </td>
                    <td className="p-4 text-gray-500 dark:text-zinc-500">
                      {item.minimumQuantity} units
                    </td>
                    <td className="p-4">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-500 dark:text-red-400 animate-pulse">
                          <AlertTriangle size={14} /> Low Stock Alert
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-500">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="p-2 text-gray-400 hover:text-brand-red rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                        title="Restock Item"
                      >
                        <Edit3 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* EDIT MODAL FOR RESTOCKING */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedItem(null)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl max-w-sm w-full p-6 sm:p-8 border border-gray-100 dark:border-zinc-800 relative z-10 shadow-2xl"
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-500 dark:text-zinc-350 cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="mb-6">
                <span className="text-xs font-bold text-brand-red uppercase tracking-wider">Restock Ingredient</span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-50 capitalize mt-0.5">{selectedItem.itemName}</h3>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Quantity */}
                <div>
                  <label className="custom-label">New Stock Quantity (Units)</label>
                  <input
                    type="number"
                    placeholder="e.g. 50"
                    className="custom-input"
                    {...register('quantity', { required: true, min: 0 })}
                  />
                </div>

                {/* Minimum Threshold */}
                <div>
                  <label className="custom-label">Alert Threshold (Units)</label>
                  <input
                    type="number"
                    placeholder="e.g. 5"
                    className="custom-input"
                    {...register('minimumQuantity', { required: true, min: 0 })}
                  />
                </div>

                {/* Actions */}
                <button
                  type="submit"
                  disabled={btnLoading}
                  className="w-full btn-primary flex items-center justify-center gap-1.5 mt-6 cursor-pointer"
                >
                  {btnLoading ? <Loader2 className="animate-spin" size={18} /> : 'Save Stock Details'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminInventory;
