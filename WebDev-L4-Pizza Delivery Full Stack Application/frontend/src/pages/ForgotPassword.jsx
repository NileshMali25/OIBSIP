import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { authStart, authFailure, clearError } from '../redux/authSlice';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    dispatch(authStart());
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Password reset OTP sent to your email.');
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to send OTP';
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
        <Link to="/login" className="absolute top-8 left-8 text-gray-500 hover:text-brand-red flex items-center gap-1.5 text-sm font-medium">
          <ArrowLeft size={16} /> Back
        </Link>

        <div className="text-center mt-6 mb-8">
          <span className="text-4xl">🔑</span>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-zinc-50 mt-3">Forgot Password</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1.5">Enter your email and we'll send you an OTP to reset your password</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="custom-label">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="custom-input pl-10"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            Send OTP <ArrowRight size={18} />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
