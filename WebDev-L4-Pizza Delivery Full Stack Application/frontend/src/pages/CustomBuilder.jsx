import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, ShoppingBag, ShoppingCart, Sparkles, Check } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/cartSlice';
import api from '../services/api';
import toast from 'react-hot-toast';

const STEP_TITLES = ['Choose Crust', 'Choose Sauce', 'Choose Cheese', 'Choose Toppings', 'Pizza Design'];

// Fallback options in case DB inventory is not seeded yet
const DEFAULT_CRUSTS = ['Thin Crust', 'Cheese Burst', 'Pan', 'Stuffed', 'Whole Wheat'];
const DEFAULT_SAUCES = ['Tomato Sauce', 'Schezwan Sauce', 'Pesto Sauce', 'Garlic Sauce', 'BBQ Sauce'];
const DEFAULT_CHEESES = ['Mozzarella', 'Cheddar', 'Paneer Cheese', 'Double Cheese'];
const DEFAULT_TOPPINGS = ['Onion', 'Capsicum', 'Tomato', 'Olives', 'Corn', 'Paneer', 'Mushroom', 'Jalapeno', 'Extra Cheese'];

const generateAINameAndImage = (crust, sauce, cheese, toppings) => {
  const selectedToppings = toppings.length > 0 ? toppings : ['Cheese'];
  const mainTopping = selectedToppings[0];
  const secondTopping = selectedToppings[1] || '';
  
  const adjectives = [
    'Ultimate', 'Gourmet', 'Rustic', 'Spicy', 'Royal', 'Smoky', 'Classic', 'Supreme', 'Chef\'s Special'
  ];
  const nouns = [
    'Feast', 'Sensation', 'Delight', 'Paradise', 'Inferno', 'Bliss', 'Fiesta', 'Extravaganza'
  ];
  
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  let name = '';
  if (secondTopping) {
    name = `${adj} ${mainTopping} & ${secondTopping} ${noun}`;
  } else {
    name = `${adj} ${mainTopping} ${noun}`;
  }
  
  let image = "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80"; // Default cheesy pepperoni
  
  if (selectedToppings.some(t => t.toLowerCase().includes('paneer'))) {
    image = "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=600&q=80";
  } else if (selectedToppings.some(t => t.toLowerCase().includes('mushroom') || t.toLowerCase().includes('olive') || t.toLowerCase().includes('capsicum'))) {
    image = "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=600&q=80";
  } else if (cheese === 'Double Cheese' || crust === 'Cheese Burst' || selectedToppings.includes('Extra Cheese')) {
    image = "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80";
  } else {
    image = "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80";
  }
  
  return { name, image };
};

const CustomBuilder = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState({
    crusts: DEFAULT_CRUSTS,
    sauces: DEFAULT_SAUCES,
    cheeses: DEFAULT_CHEESES,
    vegetables: DEFAULT_TOPPINGS,
    meats: []
  });

  // User selections
  const [selectedCrust, setSelectedCrust] = useState('Thin Crust');
  const [selectedSauce, setSelectedSauce] = useState('Tomato Sauce');
  const [selectedCheese, setSelectedCheese] = useState('Mozzarella');
  const [selectedVeggies, setSelectedVeggies] = useState([]);
  
  // AI selections
  const [aiName, setAiName] = useState('');
  const [aiImage, setAiImage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Trigger AI generation when entering Step 5
  useEffect(() => {
    if (step === 5) {
      triggerAIGeneration();
    }
  }, [step]);

  const triggerAIGeneration = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const generated = generateAINameAndImage(selectedCrust, selectedSauce, selectedCheese, selectedVeggies);
      setAiName(generated.name);
      setAiImage(generated.image);
      setIsGenerating(false);
      toast.success('Pizza design ready! ✨');
    }, 1200);
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory/public');
      const fetched = res.data.data.options;
      
      // Merge with defaults to ensure we always have items to render
      setOptions({
        crusts: fetched.crusts.length > 0 ? fetched.crusts : DEFAULT_CRUSTS,
        sauces: fetched.sauces.length > 0 ? fetched.sauces : DEFAULT_SAUCES,
        cheeses: fetched.cheeses.length > 0 ? fetched.cheeses : DEFAULT_CHEESES,
        vegetables: fetched.vegetables.length > 0 ? fetched.vegetables : DEFAULT_TOPPINGS,
        meats: fetched.meats || []
      });
    } catch (err) {
      console.log('Using default ingredients for builder (offline/fresh DB fallback)');
    } finally {
      setLoading(false);
    }
  };

  // Dynamic price math matching backend order controller
  const calculatePrice = () => {
    let price = 150; // Base flat price

    // Crust addition
    if (selectedCrust === 'Cheese Burst') price += 60;
    else if (selectedCrust === 'Stuffed') price += 50;
    else if (selectedCrust === 'Thin Crust') price += 20;
    else price += 30; // Pan, Whole Wheat

    // Sauce flat rate included

    // Cheese additions
    if (selectedCheese === 'Double Cheese') price += 50;
    else if (selectedCheese === 'Cheddar') price += 40;
    else price += 30; // Mozzarella, Paneer

    // Veggies additions (₹20 per topping)
    price += (selectedVeggies.length * 20);

    return price;
  };

  const handleVeggieToggle = (veg) => {
    if (selectedVeggies.includes(veg)) {
      setSelectedVeggies(selectedVeggies.filter(v => v !== veg));
    } else {
      setSelectedVeggies([...selectedVeggies, veg]);
    }
  };

  const handleAddToCart = () => {
    const customPizza = {
      name: aiName || 'Custom Pizza',
      image: aiImage || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
      base: selectedCrust,
      sauce: selectedSauce,
      cheese: selectedCheese,
      vegetables: selectedVeggies,
      price: calculatePrice()
    };

    dispatch(addToCart({ customPizza, quantity: 1 }));
    toast.success(`"${customPizza.name}" added to cart! 🛒`);
    navigate('/cart');
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/20 text-brand-orange text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles size={12} /> Custom Creator
        </span>
        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-zinc-50">Custom Pizza Builder</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">Design your perfect custom pizza step-by-step</p>
      </div>

      {/* Step Indicators */}
      <div className="max-w-2xl mx-auto mb-12 flex justify-between relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-zinc-800 -translate-y-1/2 z-0"></div>
        {STEP_TITLES.map((title, i) => {
          const stepNum = i + 1;
          const isDone = step > stepNum;
          const isCurrent = step === stepNum;
          return (
            <div key={i} className="relative z-10 flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                isDone 
                  ? 'bg-brand-red border-brand-red text-white' 
                  : isCurrent 
                    ? 'bg-white dark:bg-zinc-950 border-brand-red text-brand-red scale-110 shadow shadow-brand-red/10' 
                    : 'bg-white dark:bg-zinc-950 border-gray-300 dark:border-zinc-800 text-gray-400'
              }`}>
                {isDone ? <Check size={16} /> : stepNum}
              </div>
              <span className={`text-[10px] font-bold mt-2 uppercase tracking-wide hidden sm:block ${
                isCurrent ? 'text-brand-red' : 'text-gray-400 dark:text-zinc-600'
              }`}>
                {title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Builder Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Middle Content Options */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900/20 rounded-2xl border border-gray-100 dark:border-zinc-800/80 p-6 sm:p-8 min-h-[400px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-50 mb-6 pb-2 border-b border-gray-50 dark:border-zinc-800/50">
                {STEP_TITLES[step - 1]}
              </h3>

              {/* STEP 1: CRUST */}
              {step === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {options.crusts.map((crust) => (
                    <button
                      key={crust}
                      onClick={() => setSelectedCrust(crust)}
                      className={`p-4 rounded-xl border-2 text-left transition-all relative cursor-pointer ${
                        selectedCrust === crust
                          ? 'border-brand-red bg-red-50/10'
                          : 'border-gray-100 dark:border-zinc-800/80 hover:border-gray-200 dark:hover:border-zinc-800'
                      }`}
                    >
                      <div className="font-bold text-gray-800 dark:text-zinc-100 mb-1">{crust}</div>
                      <div className="text-xs text-gray-400 dark:text-zinc-500">
                        {crust === 'Cheese Burst' ? '+₹60 Extra Cheese burst inside' :
                         crust === 'Stuffed' ? '+₹50 Stuffed crust borders' :
                         crust === 'Thin Crust' ? '+₹20 Classic crispy base' : '+₹30 Traditional recipe'}
                      </div>
                      {selectedCrust === crust && (
                        <span className="absolute top-4 right-4 text-brand-red"><Check size={18} /></span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* STEP 2: SAUCE */}
              {step === 2 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {options.sauces.map((sauce) => (
                    <button
                      key={sauce}
                      onClick={() => setSelectedSauce(sauce)}
                      className={`p-4 rounded-xl border-2 text-left transition-all relative cursor-pointer ${
                        selectedSauce === sauce
                          ? 'border-brand-red bg-red-50/10'
                          : 'border-gray-100 dark:border-zinc-800/80 hover:border-gray-200 dark:hover:border-zinc-800'
                      }`}
                    >
                      <div className="font-bold text-gray-800 dark:text-zinc-100 mb-1">{sauce}</div>
                      <div className="text-xs text-gray-400 dark:text-zinc-500">Fresh sauce base layer</div>
                      {selectedSauce === sauce && (
                        <span className="absolute top-4 right-4 text-brand-red"><Check size={18} /></span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* STEP 3: CHEESE */}
              {step === 3 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {options.cheeses.map((cheese) => (
                    <button
                      key={cheese}
                      onClick={() => setSelectedCheese(cheese)}
                      className={`p-4 rounded-xl border-2 text-left transition-all relative cursor-pointer ${
                        selectedCheese === cheese
                          ? 'border-brand-red bg-red-50/10'
                          : 'border-gray-100 dark:border-zinc-800/80 hover:border-gray-200 dark:hover:border-zinc-800'
                      }`}
                    >
                      <div className="font-bold text-gray-800 dark:text-zinc-100 mb-1">{cheese}</div>
                      <div className="text-xs text-gray-400 dark:text-zinc-500">
                        {cheese === 'Double Cheese' ? '+₹50 Extra melting mozzarella' :
                         cheese === 'Cheddar' ? '+₹40 Rich Cheddar flavor' : '+₹30 standard cheese layer'}
                      </div>
                      {selectedCheese === cheese && (
                        <span className="absolute top-4 right-4 text-brand-red"><Check size={18} /></span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* STEP 4: TOPPINGS */}
              {step === 4 && (
                <div>
                  <div className="mb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Vegetables & Additions (₹20 per topping)</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {options.vegetables.map((veg) => {
                      const isSelected = selectedVeggies.includes(veg);
                      return (
                        <button
                          key={veg}
                          onClick={() => handleVeggieToggle(veg)}
                          className={`p-3 rounded-lg border-2 text-center font-semibold text-xs transition-all relative cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'border-brand-red bg-red-50/10 text-brand-red'
                              : 'border-gray-100 dark:border-zinc-800/85 text-gray-700 dark:text-zinc-300 hover:border-gray-200'
                          }`}
                        >
                          <span className="capitalize">{veg}</span>
                          {isSelected && <Check size={14} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 5: Pizza Design */}
              {step === 5 && (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center space-y-4 py-12">
                      <div className="w-16 h-16 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm font-bold text-gray-500 dark:text-zinc-400 animate-pulse">
                        Preparing your custom pizza design...
                      </p>
                    </div>
                  ) : (
                    <div className="w-full max-w-md mx-auto space-y-6">
                      <div className="relative rounded-2xl overflow-hidden border-2 border-zinc-100 dark:border-zinc-800 shadow-xl group">
                        <img 
                          src={aiImage} 
                          alt={aiName} 
                          className="w-full h-64 object-cover"
                        />
                        <div className="absolute top-4 right-4 bg-zinc-950/80 backdrop-blur text-brand-orange px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 shadow">
                          <Sparkles size={12} className="animate-spin" /> Custom Pizza
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-2xl font-black text-gray-900 dark:text-zinc-50 tracking-tight">
                          {aiName}
                        </h4>
                        <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">
                          Created based on your selected ingredients.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls inside Card */}
          <div className="mt-12 pt-6 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-500 dark:text-zinc-400 hover:text-brand-red dark:hover:text-brand-red disabled:opacity-30 disabled:hover:text-gray-400 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} /> Back
            </button>

            {step < 5 ? (
              <button
                onClick={nextStep}
                className="btn-secondary py-2 flex items-center gap-1.5 text-sm"
              >
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={isGenerating}
                className="btn-primary py-2.5 flex items-center gap-1.5 text-sm disabled:opacity-50"
              >
                <ShoppingCart size={16} /> Add to Cart
              </button>
            )}
          </div>
        </div>

        {/* Right Summary Panel */}
        <div className="bg-white dark:bg-zinc-900/40 rounded-2xl border border-gray-100 dark:border-zinc-800/80 p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-50 mb-4 pb-2 border-b border-gray-50 dark:border-zinc-800/50">
              Pizza Recipe Summary
            </h3>

            <div className="space-y-3.5 text-sm mb-8">
              {step === 5 && aiName && (
                <div className="p-3 bg-red-50/10 border border-brand-red/20 rounded-xl mb-4 text-left">
                  <span className="text-[10px] font-bold text-brand-red uppercase tracking-wider block">Pizza Name</span>
                  <span className="text-sm font-black text-gray-900 dark:text-zinc-50">{aiName}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 dark:text-zinc-500">Base Flat Rate</span>
                <span className="font-bold">₹150.00</span>
              </div>

              {/* Crust */}
              <div className="flex justify-between items-center">
                <div>
                  <span className="block font-bold text-gray-700 dark:text-zinc-300">Base Crust</span>
                  <span className="text-xs text-gray-400 dark:text-zinc-500">{selectedCrust}</span>
                </div>
                <span className="font-semibold text-gray-600 dark:text-zinc-400">
                  {selectedCrust === 'Cheese Burst' ? '+₹60.00' :
                   selectedCrust === 'Stuffed' ? '+₹50.00' :
                   selectedCrust === 'Thin Crust' ? '+₹20.00' : '+₹30.00'}
                </span>
              </div>

              {/* Sauce */}
              <div className="flex justify-between items-center">
                <div>
                  <span className="block font-bold text-gray-700 dark:text-zinc-300">Base Sauce</span>
                  <span className="text-xs text-gray-400 dark:text-zinc-500">{selectedSauce}</span>
                </div>
                <span className="font-semibold text-gray-600 dark:text-zinc-400">+₹0.00</span>
              </div>

              {/* Cheese */}
              <div className="flex justify-between items-center">
                <div>
                  <span className="block font-bold text-gray-700 dark:text-zinc-300">Cheese Blend</span>
                  <span className="text-xs text-gray-400 dark:text-zinc-500">{selectedCheese}</span>
                </div>
                <span className="font-semibold text-gray-600 dark:text-zinc-400">
                  {selectedCheese === 'Double Cheese' ? '+₹50.00' :
                   selectedCheese === 'Cheddar' ? '+₹40.00' : '+₹30.00'}
                </span>
              </div>

              {/* Toppings list */}
              {selectedVeggies.length > 0 && (
                <div className="pt-2 border-t border-dashed border-gray-100 dark:border-zinc-800">
                  <span className="block font-bold text-gray-700 dark:text-zinc-300 mb-1.5">Selected Toppings</span>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {selectedVeggies.map((veg, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-gray-50 dark:bg-zinc-800 dark:text-zinc-300 border border-gray-100 dark:border-zinc-700 capitalize">
                        {veg}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-zinc-400">
                    <span>{selectedVeggies.length} Toppings (x₹20)</span>
                    <span className="font-bold text-gray-700 dark:text-zinc-300">₹{(selectedVeggies.length * 20).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Box */}
          <div className="border-t border-gray-100 dark:border-zinc-800/80 pt-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-500 dark:text-zinc-400">Total Price</span>
              <span className="text-3xl font-black text-brand-red">₹{calculatePrice().toFixed(2)}</span>
            </div>
            
            {step === 5 && (
              <button
                onClick={handleAddToCart}
                disabled={isGenerating}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-50"
              >
                <ShoppingBag size={18} /> Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomBuilder;
