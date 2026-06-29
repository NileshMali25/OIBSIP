import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { authStart, authSuccess, authFailure, clearError, logout } from '../redux/authSlice';

const AdminLogin = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  // Clear auth slice errors on mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Redirect if already authenticated as Admin
  useEffect(() => {
    if (isAuthenticated && user?.role === 'Admin') {
      navigate('/admin');
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data) => {
    dispatch(authStart());
    try {
      const res = await api.post('/auth/login', data);
      const loggedUser = res.data.data.user;

      if (loggedUser.role !== 'Admin') {
        dispatch(logout());
        dispatch(authFailure('Access Denied: You are not authorized to access the Admin Panel.'));
        toast.error('Access Denied: Admin credentials required!');
        return;
      }

      dispatch(authSuccess({ user: loggedUser, token: res.data.token }));
      toast.success('Welcome back, Admin! 🍕');
      navigate('/admin');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed';
      dispatch(authFailure(errMsg));
      toast.error(errMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-2xl bg-zinc-900/50 backdrop-blur-md border border-zinc-800 shadow-2xl relative"
      >
        {/* Admin Header Icon */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-950/20 text-brand-red border border-brand-red/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-zinc-50 tracking-tight">Staff Portal</h2>
          <p className="text-xs text-zinc-400 mt-2 uppercase tracking-widest">Admin Control Center</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/25 border border-red-900/50 text-sm text-red-400 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email field */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Admin Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Mail size={18} />
              </div>
              <input
                type="email"
                placeholder="admin@pizzadelivery.com"
                className={`w-full px-4 py-2.5 rounded-lg border border-zinc-800 bg-zinc-950/50 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red transition-all duration-200 pl-10 ${errors.email ? 'border-red-500' : ''}`}
                {...register('email', { 
                  required: 'Admin email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                })}
              />
            </div>
            {errors.email && <span className="text-xs text-red-500 mt-1 block">{errors.email.message}</span>}
          </div>

          {/* Password field */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Secret Keyphrase</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Lock size={18} />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 rounded-lg border border-zinc-800 bg-zinc-950/50 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red transition-all duration-200 pl-10 ${errors.password ? 'border-red-500' : ''}`}
                {...register('password', { required: 'Password is required' })}
              />
            </div>
            {errors.password && <span className="text-xs text-red-500 mt-1 block">{errors.password.message}</span>}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary bg-gradient-to-r from-red-600 to-orange-600 shadow-red-950/20 py-3 flex items-center justify-center gap-2 cursor-pointer font-bold uppercase tracking-wider"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                Access Dashboard <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-zinc-500">
          This portal is restricted to authorized PizzaGo personnel only.
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
