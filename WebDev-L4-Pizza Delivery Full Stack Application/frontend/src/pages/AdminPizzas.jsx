import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, ToggleLeft, ToggleRight, Loader2, X, Image as ImageIcon, Sparkles } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const AdminPizzas = () => {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchPizzas();
  }, []);

  const fetchPizzas = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pizzas?limit=50');
      setPizzas(res.data.data.pizzas);
    } catch (err) {
      toast.error('Failed to fetch pizzas catalog');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailable = async (pizzaId, currentVal) => {
    try {
      await api.patch(`/pizzas/${pizzaId}/toggle`);
      setPizzas(pizzas.map(p => p._id === pizzaId ? { ...p, available: !currentVal } : p));
      toast.success('Pizza status updated!');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (pizzaId) => {
    if (!window.confirm('Are you sure you want to delete this preset pizza?')) return;
    try {
      await api.delete(`/pizzas/${pizzaId}`);
      setPizzas(pizzas.filter(p => p._id !== pizzaId));
      toast.success('Pizza deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete pizza');
    }
  };

  const onSubmit = async (data) => {
    setBtnLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('basePrice', data.basePrice);
      
      // Parse ingredients into array
      const ingredientsArray = data.ingredients.split(',').map(i => i.trim()).filter(Boolean);
      ingredientsArray.forEach(ing => {
        formData.append('ingredients[]', ing);
      });

      if (imageFile) {
        formData.append('image', imageFile);
      } else {
        // Fallback placeholder image if none selected
        formData.append('image', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80');
      }

      const res = await api.post('/pizzas', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('New pizza added successfully! 🍕');
      setPizzas([res.data.data.pizza, ...pizzas]);
      setShowAddModal(false);
      reset();
      setImageFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add pizza');
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-zinc-50 tracking-tight">Manage Pizza Catalog</h1>
          <p className="text-sm text-gray-400 dark:text-zinc-500 mt-1">Configure preset menu items and toggles</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary py-2.5 flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus size={18} /> Add New Pizza
        </button>
      </div>

      {/* Pizzas Catalog Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-brand-red" size={36} />
        </div>
      ) : pizzas.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900/20 border border-gray-100 dark:border-zinc-805/50 rounded-2xl">
          <h4 className="text-lg font-bold text-gray-700 dark:text-zinc-400">Empty Catalog</h4>
          <p className="text-xs text-gray-400 mt-1 mb-4">No preset menu items available. Create one above.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900/40 rounded-xl border border-gray-150/70 dark:border-zinc-800/60 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-zinc-850 bg-gray-50/50 dark:bg-zinc-900/30 text-gray-400 dark:text-zinc-500 font-bold">
                <th className="p-4 font-semibold">Image</th>
                <th className="p-4 font-semibold">Pizza Name</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Base Price</th>
                <th className="p-4 font-semibold">Available</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-850/50">
              {pizzas.map((pizza) => (
                <tr key={pizza._id} className="hover:bg-gray-50/30 dark:hover:bg-zinc-850/10 transition-colors">
                  <td className="p-4">
                    <img 
                      src={pizza.image} 
                      alt={pizza.name} 
                      className="w-12 h-12 object-cover rounded-lg border border-gray-100 dark:border-zinc-805"
                    />
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-gray-800 dark:text-zinc-200 block">{pizza.name}</span>
                    <span className="text-[10px] text-gray-400 line-clamp-1 max-w-[200px] sm:max-w-xs">{pizza.description}</span>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm ${
                      pizza.category === 'Veg' 
                        ? 'bg-green-50 dark:bg-green-950/20 text-green-600 border-green-200 dark:border-green-800' 
                        : pizza.category === 'Non-Veg' 
                          ? 'bg-red-50 dark:bg-red-950/20 text-red-500 border-red-200 dark:border-red-800'
                          : 'bg-blue-50 dark:bg-blue-950/20 text-blue-500 border-blue-200 dark:border-blue-800'
                    }`}>
                      {pizza.category}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-gray-800 dark:text-zinc-250">
                    ₹{pizza.basePrice}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleAvailable(pizza._id, pizza.available)}
                      className="text-gray-400 hover:text-brand-red cursor-pointer"
                    >
                      {pizza.available ? (
                        <ToggleRight className="text-green-500" size={32} />
                      ) : (
                        <ToggleLeft size={32} />
                      )}
                    </button>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleDelete(pizza._id)}
                      className="p-2 text-gray-400 hover:text-brand-red rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                      title="Delete Pizza"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD PIZZA DIALOG MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full p-6 sm:p-8 overflow-y-auto max-h-[90vh] border border-gray-100 dark:border-zinc-800 relative z-10 shadow-2xl"
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-500 dark:text-zinc-350 cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="mb-6 flex items-center gap-2">
                <span className="text-2xl">🍕</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-50">Add Menu Pizza</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Define ingredients and upload to cloud</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="custom-label">Pizza Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Farmhouse Premium"
                    className="custom-input"
                    {...register('name', { required: 'Name is required' })}
                  />
                  {errors.name && <span className="text-xs text-red-500 mt-1 block">{errors.name.message}</span>}
                </div>

                {/* Base price & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="custom-label">Base Price (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 290"
                      className="custom-input"
                      {...register('basePrice', { required: 'Price is required', min: 1 })}
                    />
                    {errors.basePrice && <span className="text-xs text-red-500 mt-1 block">{errors.basePrice.message}</span>}
                  </div>

                  <div>
                    <label className="custom-label">Category</label>
                    <select
                      className="custom-input"
                      {...register('category', { required: 'Category is required' })}
                    >
                      <option value="Veg">Veg</option>
                      <option value="Non-Veg">Non-Veg</option>
                      <option value="Sides">Sides</option>
                      <option value="Beverages">Beverages</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="custom-label">Description</label>
                  <textarea
                    placeholder="Brief description of toppings, cheese flavor, crust notes..."
                    rows="3"
                    className="custom-input"
                    {...register('description', { required: 'Description is required' })}
                  />
                  {errors.description && <span className="text-xs text-red-500 mt-1 block">{errors.description.message}</span>}
                </div>

                {/* Ingredients */}
                <div>
                  <label className="custom-label">Ingredients (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. mushroom, onion, capsicum, olives"
                    className="custom-input"
                    {...register('ingredients', { required: 'Ingredients are required' })}
                  />
                  {errors.ingredients && <span className="text-xs text-red-500 mt-1 block">{errors.ingredients.message}</span>}
                </div>

                {/* Image upload */}
                <div>
                  <label className="custom-label">Pizza Image Upload</label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-xl py-6 hover:bg-gray-50/50 dark:hover:bg-zinc-950/20 transition-all cursor-pointer">
                      <ImageIcon className="text-gray-400 mb-1" size={24} />
                      <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">
                        {imageFile ? imageFile.name : 'Select JPG / PNG File'}
                      </span>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        onChange={(e) => setImageFile(e.target.files[0])}
                      />
                    </label>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={btnLoading}
                  className="w-full btn-primary mt-4 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {btnLoading ? <Loader2 className="animate-spin" size={20} /> : 'Save and Compile'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPizzas;
