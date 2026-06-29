import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, Pizza, Package, ShoppingCart, LogOut, Sun, Moon, ArrowLeft, Users } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import toast from 'react-hot-toast';

const AdminLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully!');
    navigate('/admin/login');
  };

  const isActive = (path) => {
    return location.pathname === path
      ? 'bg-brand-red text-white font-bold'
      : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800/80 hover:text-gray-900 dark:hover:text-zinc-150';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-zinc-900 border-b md:border-b-0 md:border-r border-gray-250/60 dark:border-zinc-800/80 flex flex-col justify-between">
        <div>
          {/* Header Brand */}
          <div className="p-6 border-b border-gray-150 dark:border-zinc-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛠️</span>
              <span className="font-extrabold text-base uppercase tracking-wider bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                PizzaGo Admin
              </span>
            </div>
            <Link to="/" className="text-xs font-semibold text-brand-red hover:underline flex items-center gap-0.5">
              <ArrowLeft size={12} /> Menu
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <Link to="/admin" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive('/admin')}`}>
              <BarChart3 size={18} /> Overview Stats
            </Link>
            <Link to="/admin/pizzas" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive('/admin/pizzas')}`}>
              <Pizza size={18} /> Manage Catalog
            </Link>
            <Link to="/admin/inventory" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive('/admin/inventory')}`}>
              <Package size={18} /> Stock Levels
            </Link>
            <Link to="/admin/orders" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive('/admin/orders')}`}>
              <ShoppingCart size={18} /> Manage Orders
            </Link>
          </nav>
        </div>

        {/* Footer Admin info */}
        <div className="p-4 border-t border-gray-150 dark:border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src={user?.profileImage} 
              alt="Admin Profile" 
              className="w-8 h-8 rounded-full border border-gray-200 dark:border-zinc-700 object-cover"
            />
            <div className="truncate w-28">
              <span className="block text-xs font-bold text-gray-800 dark:text-zinc-300 truncate">{user?.name}</span>
              <span className="block text-[10px] text-gray-400">Pizzeria Admin</span>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-brand-red rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-grow p-6 sm:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
