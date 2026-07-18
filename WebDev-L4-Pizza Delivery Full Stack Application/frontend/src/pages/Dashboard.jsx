import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, ShoppingBag, Eye, Loader2, Award, Sparkles, Flame } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import api from '../services/api';
import PizzaModal from '../components/PizzaModal';
import HeroSection from '../components/HeroSection';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedPizza, setSelectedPizza] = useState(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPizzas();
  }, [categoryFilter]);

  const fetchPizzas = async () => {
    setLoading(true);
    try {
      let url = '/pizzas?limit=20';
      if (categoryFilter !== 'All') {
        url += `&category=${categoryFilter}`;
      }
      const res = await api.get(url);
      setPizzas(res.data.data.pizzas);
    } catch (err) {
      toast.error('Failed to load pizza catalog');
    } finally {
      setLoading(false);
    }
  };

  // Category sequence order: Veg -> Non-Veg -> Sides -> Beverages
  const CATEGORY_ORDER = {
    'Veg': 1,
    'Non-Veg': 2,
    'Sides': 3,
    'Beverages': 4
  };

  // Local filter and sorting for search & category sequence
  const filteredPizzas = pizzas
    .filter(pizza => 
      pizza.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pizza.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const orderA = CATEGORY_ORDER[a.category] || 99;
      const orderB = CATEGORY_ORDER[b.category] || 99;
      return orderA - orderB;
    });

  const handleQuickAdd = (pizza, e) => {
    e.stopPropagation(); // Avoid opening details modal
    dispatch(addToCart({ pizza, quantity: 1 }));
    toast.success(`1x ${pizza.name} added to cart! 🛒`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 1. HERO CTA BANNER */}
      <HeroSection />

      {/* 2. CONTROLS SECTION (Search, Category Filters) */}
      <div id="menu-catalog" className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
            Our Delicious Menu <Flame className="text-brand-red fill-brand-red animate-pulse" size={24} />
          </h2>
          <p className="text-sm text-gray-400 dark:text-zinc-500 mt-1">Fresh ingredients, baked with passion</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search pizzas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="custom-input pl-9 py-2 text-sm w-full sm:w-60"
            />
          </div>

          {/* Category Filter tabs */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-900 p-1 rounded-xl">
            {['All', 'Veg', 'Non-Veg', 'Sides', 'Beverages'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-white dark:bg-zinc-800 text-brand-red shadow-sm'
                    : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. CATALOG GRID */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-zinc-900/50 rounded-2xl border border-gray-100 dark:border-zinc-800/80 p-4 h-96 flex flex-col justify-between">
              <div className="bg-gray-200 dark:bg-zinc-800 w-full h-44 rounded-xl mb-4"></div>
              <div>
                <div className="h-6 bg-gray-200 dark:bg-zinc-800 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-full mb-1"></div>
                <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-5/6"></div>
              </div>
              <div className="flex justify-between items-center mt-6">
                <div className="h-8 bg-gray-200 dark:bg-zinc-800 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 dark:bg-zinc-800 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredPizzas.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900/20 rounded-3xl border border-gray-100 dark:border-zinc-800/50">
          <span className="text-5xl">🍕</span>
          <h3 className="text-xl font-bold text-gray-700 dark:text-zinc-400 mt-4">No Pizzas Found</h3>
          <p className="text-sm text-gray-400 dark:text-zinc-500 mt-1">Try resetting your search query or category filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPizzas.map((pizza) => (
            <motion.div
              layout
              key={pizza._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-zinc-900/40 hover:bg-white dark:hover:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group relative"
            >
              {/* Product Image */}
              <div className="relative h-48 overflow-hidden bg-gray-50 dark:bg-zinc-950">
                <img
                  src={pizza.image}
                  alt={pizza.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Category Indicator */}
                <span className={`absolute top-4 left-4 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow ${
                  pizza.category === 'Veg' ? 'bg-green-500' : pizza.category === 'Non-Veg' ? 'bg-red-500' : 'bg-blue-500'
                }`}>
                  {pizza.category}
                </span>
              </div>

              {/* Product Info */}
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-zinc-50 line-clamp-1 mb-1">{pizza.name}</h3>
                  <p className="text-xs text-gray-400 dark:text-zinc-500 line-clamp-2 leading-relaxed mb-4">{pizza.description}</p>
                </div>

                <div className="flex items-center justify-between mt-auto border-t border-gray-50 dark:border-zinc-800/50 pt-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Start at</span>
                    <span className="text-xl font-black text-gray-800 dark:text-zinc-100">₹{pizza.basePrice}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View Details Button */}
                    <button
                      onClick={() => setSelectedPizza(pizza)}
                      className="p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400 transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>

                    {/* Quick Add Button */}
                    <button
                      onClick={(e) => handleQuickAdd(pizza, e)}
                      className="p-2.5 rounded-xl bg-brand-red text-white hover:brightness-110 shadow shadow-brand-red/10 active:scale-95 transition-all cursor-pointer"
                      title="Quick Add"
                    >
                      <ShoppingBag size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 4. PIZZA MODAL DETAILS VIEW */}
      {selectedPizza && (
        <PizzaModal
          pizza={selectedPizza}
          onClose={() => setSelectedPizza(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
