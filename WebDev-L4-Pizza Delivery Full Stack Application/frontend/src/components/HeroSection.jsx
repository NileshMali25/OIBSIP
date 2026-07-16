import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Flame } from 'lucide-react';

const HERO_PIZZAS = [
  {
    name: "BBQ chicken pizza",
    description: "Smoky barbecue chicken pieces combined with sweet onions and melted cheese.",
    price: 399,
    category: "Non-Veg",
    image: "https://res.cloudinary.com/dhc4icfi6/image/upload/v1783885563/pizzas/pzuccfpyhqwpbdwgzze8.jpg",
    glowColor: "rgba(239, 68, 68, 0.45)",
    accentGradient: "from-red-500 to-orange-500",
    badgeClass: "text-red-500 bg-red-500/10 border-red-500/20"
  },
  {
    name: "Pepperoni Supreme",
    description: "An American classic loaded with double helpings of spicy cured pepperoni slices, extra mozzarella, and seasoned Italian herbs.",
    price: 399,
    category: "Non-Veg",
    image: "https://res.cloudinary.com/dhc4icfi6/image/upload/v1783883887/pizzas/jxfi1pelj6l0mhrazc5n.webp",
    glowColor: "rgba(249, 115, 22, 0.45)",
    accentGradient: "from-orange-500 to-amber-500",
    badgeClass: "text-orange-500 bg-orange-500/10 border-orange-500/20"
  },
  {
    name: "Farmhouse pizza",
    description: "A healthy, crunchy medley of onions, green capsicum, juicy tomatoes, and fresh mushrooms.",
    price: 329,
    category: "Veg",
    image: "https://res.cloudinary.com/dhc4icfi6/image/upload/v1783885425/pizzas/dv3rieoe81ejqmsr4iok.webp",
    glowColor: "rgba(34, 197, 94, 0.45)",
    accentGradient: "from-green-500 to-emerald-500",
    badgeClass: "text-green-500 bg-green-500/10 border-green-500/20"
  },
  {
    name: "Paneer Pizza",
    description: "Chunky paneer cubes marinated in spices, paired with capsicum and spicy red paprika.",
    price: 359,
    category: "Veg",
    image: "https://res.cloudinary.com/dhc4icfi6/image/upload/v1783885590/pizzas/shwjyppycotysbutqiy7.jpg",
    glowColor: "rgba(234, 179, 8, 0.45)",
    accentGradient: "from-yellow-500 to-orange-500",
    badgeClass: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"
  }
];

const HeroSection = () => {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  // Automatic transition every 3.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % HERO_PIZZAS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const activePizza = HERO_PIZZAS[index];

  return (
    <div className="relative bg-zinc-950 text-white rounded-3xl p-8 sm:p-12 mb-12 shadow-2xl border border-zinc-800/80 overflow-hidden min-h-[480px] flex items-center">
      {/* Background grid details */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* Radial Color-shifting glow behind content */}
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-out pointer-events-none filter blur-[100px] opacity-20"
        style={{
          background: `radial-gradient(circle at 75% 50%, ${activePizza.glowColor} 0%, transparent 60%)`
        }}
      />

      <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Animated Info */}
        <div className="lg:col-span-7 flex flex-col justify-center h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-5"
            >
              {/* Category Badge */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] uppercase font-black tracking-widest ${activePizza.badgeClass}`}>
                <Sparkles size={12} /> {activePizza.category} Choice
              </span>

              {/* Pizza Name */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                {activePizza.name}
              </h1>

              {/* Pizza Description */}
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-lg font-medium">
                {activePizza.description}
              </p>

              {/* Pricing */}
              <div className="flex items-center gap-2 pt-2">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Start at</span>
                <span className="text-3xl sm:text-4xl font-black text-brand-red bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                  ₹{activePizza.price}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mt-8">
            <button 
              onClick={() => navigate('/custom-builder')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-extrabold hover:scale-105 active:scale-98 shadow-lg shadow-red-950/30 transition-all duration-200 cursor-pointer flex items-center gap-1.5 text-sm uppercase tracking-wider"
            >
              Build Custom 🛠️
            </button>
            <a 
              href="#menu-catalog"
              className="px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-extrabold hover:bg-zinc-850 hover:text-white transition-all duration-200 text-sm flex items-center gap-1"
            >
              View Full Menu <ArrowRight size={14} />
            </a>
          </div>

          {/* Indicators / Slider dots */}
          <div className="flex items-center gap-2 mt-10">
            {HERO_PIZZAS.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => setIndex(dotIdx)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  index === dotIdx ? 'w-8 bg-red-500' : 'w-2.5 bg-zinc-700 hover:bg-zinc-500'
                }`}
                title={`Go to slide ${dotIdx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Right Side: High-End 3D perspective pizza animation */}
        <div className="lg:col-span-5 flex items-center justify-center relative select-none">
          {/* Radial blur container */}
          <div 
            className="absolute w-80 h-80 sm:w-96 sm:h-96 lg:w-[440px] lg:h-[440px] rounded-full filter blur-[70px] opacity-40 transition-all duration-1000 ease-out"
            style={{ backgroundColor: activePizza.glowColor }}
          />

          {/* Scaling Shadow underneath the pizza */}
          <motion.div 
            animate={{ 
              scale: [1, 0.85, 1], 
              opacity: [0.35, 0.15, 0.35] 
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute bottom-[-15px] w-72 sm:w-80 lg:w-[380px] h-8 bg-black rounded-full filter blur-lg z-0 pointer-events-none"
          />

          {/* 3D Tilted Wrapper */}
          <div 
            style={{ 
              perspective: 1200, 
              transformStyle: "preserve-3d" 
            }}
            className="relative z-10 w-80 h-80 sm:w-96 sm:h-96 lg:w-[440px] lg:h-[440px] flex items-center justify-center pointer-events-none"
          >
            <motion.div
              style={{ 
                rotateX: 25, 
                rotateY: -10, 
                transformStyle: "preserve-3d" 
              }}
              className="w-full h-full flex items-center justify-center"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ rotate: -220, scale: 0.2, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 220, scale: 0.2, opacity: 0 }}
                  transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full flex items-center justify-center"
                >
                  {/* Floating vertical motion container */}
                  <motion.div
                    animate={{ y: [0, -14, 0] }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    {/* Continuous slow spin motion image */}
                    <motion.img
                      src={activePizza.image}
                      alt={activePizza.name}
                      animate={{ rotate: 360 }}
                      transition={{ 
                        duration: 35, 
                        repeat: Infinity, 
                        ease: "linear" 
                      }}
                      className="w-full h-full object-cover rounded-full border-4 border-zinc-800/40 shadow-2xl drop-shadow-[0_25px_60px_rgba(0,0,0,0.5)]"
                    />
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
