import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { authStart, authSuccess, authFailure, clearError } from '../redux/authSlice';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  // Clear auth slice errors on mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    dispatch(authStart());
    try {
      const res = await api.post('/auth/login', data);
      dispatch(authSuccess({ user: res.data.data.user, token: res.data.token }));
      toast.success('Logged in successfully! Welcome back 🍕');
      navigate('/');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed';
      dispatch(authFailure(errMsg));
      
      // If email is not verified, redirect to verify-otp
      if (err.response?.status === 403 && err.response?.data?.errorType === 'EMAIL_NOT_VERIFIED') {
        toast.error('Email not verified. Redirecting to verification page...');
        navigate(`/verify-otp?email=${encodeURIComponent(err.response.data.email)}`);
      } else {
        toast.error(errMsg);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-2xl glass-card relative"
      >
        {/* Logo/Icon */}
        <div className="text-center mb-8">
          <span className="text-4xl">🍕</span>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-zinc-50 mt-3">Welcome Back</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1.5">Sign in to order your favorite pizzas</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email field */}
          <div>
            <label className="custom-label">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                placeholder="name@example.com"
                className={`custom-input pl-10 ${errors.email ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : ''}`}
                {...register('email', { 
                  required: 'Email address is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                })}
              />
            </div>
            {errors.email && <span className="text-xs text-red-500 mt-1 block">{errors.email.message}</span>}
          </div>

          {/* Password field */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-medium text-gray-600 dark:text-zinc-400">Password</label>
              <Link to="/forgot-password" className="text-xs font-semibold text-brand-red hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className={`custom-input pl-10 ${errors.password ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : ''}`}
                {...register('password', { required: 'Password is required' })}
              />
            </div>
            {errors.password && <span className="text-xs text-red-500 mt-1 block">{errors.password.message}</span>}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Signing In...
              </>
            ) : (
              <>
                Sign In <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500 dark:text-zinc-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-red hover:underline">Register here</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
