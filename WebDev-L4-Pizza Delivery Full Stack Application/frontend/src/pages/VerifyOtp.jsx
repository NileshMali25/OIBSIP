import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, KeyRound, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { authStart, authSuccess, authFailure, clearError } from '../redux/authSlice';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  
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

  // Resend Countdown Timer
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('OTP must be exactly 6 digits');
      return;
    }

    dispatch(authStart());
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      dispatch(authSuccess(res.data.data));
      toast.success('Email verified successfully! Welcome to Pizza Delivery 🍕');
      navigate('/');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Verification failed';
      dispatch(authFailure(errMsg));
      toast.error(errMsg);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;

    try {
      await api.post('/auth/resend-otp', { email });
      toast.success('A new OTP has been sent to your email.');
      setResendTimer(30);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Resend failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-2xl glass-card text-center"
      >
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 text-brand-red rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-red/10">
            <KeyRound size={28} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-zinc-50">Email Verification</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">
            We have sent a 6-digit OTP code to: <br/>
            <span className="font-semibold text-gray-800 dark:text-zinc-200">{email}</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              maxLength="6"
              placeholder="0 0 0 0 0 0"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center tracking-widest text-3xl font-bold py-3 px-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 focus:outline-none focus:ring-2 focus:ring-brand-red/50 focus:border-brand-red dark:text-zinc-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Verify Code'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-zinc-400">Didn't receive code?</span>
          <button
            onClick={handleResend}
            disabled={resendTimer > 0}
            className={`font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              resendTimer > 0 
                ? 'text-gray-400 dark:text-zinc-600 cursor-not-allowed' 
                : 'text-brand-red hover:text-red-600'
            }`}
          >
            <RefreshCw size={14} className={resendTimer > 0 ? '' : 'animate-pulse'} />
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOtp;
