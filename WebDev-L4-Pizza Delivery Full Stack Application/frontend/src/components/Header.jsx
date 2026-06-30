import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, User, LogOut, Sun, Moon, Menu, X, Pizza } from 'lucide-react';
import { motion } from 'framer-motion';
import { logout } from '../redux/authSlice';
import toast from 'react-hot-toast';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Calculate total items in cart
  const cartItemsCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    const isAdmin = user?.role === 'Admin';
    dispatch(logout());
    toast.success('Logged out successfully! See you soon 🍕');
    if (isAdmin) {
      navigate('/admin/login');
    } else {
      navigate('/login');
    }
  };

  const isActive = (path) => {
    return location.pathname === path 
      ? 'text-brand-red font-bold' 
      : 'text-gray-600 dark:text-zinc-300 hover:text-brand-red dark:hover:text-brand-red font-medium';
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="glass-nav sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <span className="text-2xl animate-bounce">🍕</span>
            <span className="font-extrabold text-xl bg-gradient-to-r from-brand-red to-red-500 bg-clip-text text-transparent">
              PizzaGo
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className={isActive('/')}>Menu</Link>
            <Link to="/custom-builder" className={isActive('/custom-builder')}>Pizza Builder</Link>
            <Link to="/profile" className={isActive('/profile')}>My Orders</Link>
            
            {user && user.role === 'Admin' && (
              <Link to="/admin" className="px-3 py-1 rounded bg-red-50 dark:bg-red-950/20 text-brand-red border border-brand-red/10 text-sm font-semibold hover:bg-brand-red hover:text-white transition-all duration-200">
                Admin Dashboard
              </Link>
            )}
          </div>

          {/* Action Icons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-zinc-400 cursor-pointer"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Cart Icon */}
            <Link to="/cart" className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300">
              <ShoppingCart size={21} />
              {cartItemsCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-brand-red text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown stub */}
            <Link to="/profile" className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-zinc-850">
              <img 
                src={user?.profileImage} 
                alt="Profile" 
                className="w-8 h-8 rounded-full border border-gray-200 dark:border-zinc-700 object-cover"
              />
              <span className="text-sm font-semibold text-gray-700 dark:text-zinc-300 max-w-[100px] truncate">
                {user?.name.split(' ')[0]}
              </span>
            </Link>

            {/* Logout */}
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-brand-red rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {/* Cart Icon */}
            <Link to="/cart" className="relative p-2 text-gray-600 dark:text-zinc-300">
              <ShoppingCart size={20} />
              {cartItemsCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-brand-red text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-600 dark:text-zinc-300 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden border-t border-gray-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 px-4 pt-2 pb-4 space-y-2"
        >
          <Link 
            to="/" 
            className="block px-3 py-2 rounded-lg text-base font-semibold hover:bg-gray-50 dark:hover:bg-zinc-900"
            onClick={() => setIsOpen(false)}
          >
            Menu
          </Link>
          <Link 
            to="/custom-builder" 
            className="block px-3 py-2 rounded-lg text-base font-semibold hover:bg-gray-50 dark:hover:bg-zinc-900"
            onClick={() => setIsOpen(false)}
          >
            Pizza Builder
          </Link>
          <Link 
            to="/profile" 
            className="block px-3 py-2 rounded-lg text-base font-semibold hover:bg-gray-50 dark:hover:bg-zinc-900"
            onClick={() => setIsOpen(false)}
          >
            My Orders
          </Link>
          
          {user && user.role === 'Admin' && (
            <Link 
              to="/admin" 
              className="block px-3 py-2 rounded-lg text-base font-semibold text-brand-red hover:bg-red-50 dark:hover:bg-red-950/10"
              onClick={() => setIsOpen(false)}
            >
              Admin Dashboard
            </Link>
          )}

          <div className="pt-4 border-t border-gray-150 dark:border-zinc-800 flex items-center justify-between">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400 font-semibold"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />} Theme Mode
            </button>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-red-500 font-semibold"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Header;
