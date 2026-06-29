import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { authStart, authFailure, clearError } from '../redux/authSlice';

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const password = watch('password', '');

  const onSubmit = async (data) => {
    dispatch(authStart());
    try {
      await api.post('/auth/register', data);
      toast.success('Registration successful! Check your email for OTP.');
      navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed';
      dispatch(authFailure(errMsg));
      toast.error(errMsg);
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
        <div className="text-center mb-8">
          <span className="text-4xl">🍕</span>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-zinc-50 mt-3">Create Account</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1.5">Sign up to get fresh pizzas delivered to your door</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <label className="custom-label">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input
                type="text"
                placeholder="John Doe"
                className={`custom-input pl-10 ${errors.name ? 'border-red-500' : ''}`}
                {...register('name', { required: 'Name is required' })}
              />
            </div>
            {errors.name && <span className="text-xs text-red-500 mt-1 block">{errors.name.message}</span>}
          </div>

          {/* Email */}
          <div>
            <label className="custom-label">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                placeholder="name@example.com"
                className={`custom-input pl-10 ${errors.email ? 'border-red-500' : ''}`}
                {...register('email', { 
                  required: 'Email address is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                })}
              />
            </div>
            {errors.email && <span className="text-xs text-red-500 mt-1 block">{errors.email.message}</span>}
          </div>

          {/* Phone */}
          <div>
            <label className="custom-label">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Phone size={18} />
              </div>
              <input
                type="text"
                placeholder="+919876543210"
                className={`custom-input pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                {...register('phone', { 
                  required: 'Phone number is required',
                  pattern: { value: /^\+?[1-9]\d{1,14}$/, message: 'Please enter a valid phone number' }
                })}
              />
            </div>
            {errors.phone && <span className="text-xs text-red-500 mt-1 block">{errors.phone.message}</span>}
          </div>

          {/* Password */}
          <div>
            <label className="custom-label">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                className={`custom-input pl-10 ${errors.password ? 'border-red-500' : ''}`}
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
              />
            </div>
            {errors.password && <span className="text-xs text-red-500 mt-1 block">{errors.password.message}</span>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="custom-label">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                placeholder="Confirm password"
                className={`custom-input pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                {...register('confirmPassword', { 
                  required: 'Confirm password is required',
                  validate: value => value === password || 'Passwords do not match'
                })}
              />
            </div>
            {errors.confirmPassword && <span className="text-xs text-red-500 mt-1 block">{errors.confirmPassword.message}</span>}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full btn-primary mt-2 flex items-center justify-center gap-2"
          >
            Register <ArrowRight size={18} />
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500 dark:text-zinc-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-red hover:underline">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
