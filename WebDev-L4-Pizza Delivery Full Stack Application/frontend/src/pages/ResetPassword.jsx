import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, Lock, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { authStart, authFailure, clearError } from '../redux/authSlice';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      email: email,
      otp: '',
      password: '',
      confirmPassword: ''
    }
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const password = watch('password', '');

  const onSubmit = async (data) => {
    dispatch(authStart());
    try {
      await api.post('/auth/reset-password', {
        email: data.email,
        otp: data.otp,
        password: data.password,
        confirmPassword: data.confirmPassword
      });
      toast.success('Password reset successful! Please log in with your new password.');
      navigate('/login');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Password reset failed';
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
          <span className="text-4xl">🔐</span>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-zinc-50 mt-3">Reset Password</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1.5 font-medium">
            Reset password for email: <br/>
            <span className="text-gray-800 dark:text-zinc-200 font-semibold">{email}</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email (Hidden or Readonly) */}
          <input type="hidden" {...register('email')} />

          {/* OTP Code */}
          <div>
            <label className="custom-label">Verification OTP Code</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <KeyRound size={18} />
              </div>
              <input
                type="text"
                maxLength="6"
                placeholder="Enter 6-digit OTP"
                className={`custom-input pl-10 tracking-wide font-medium ${errors.otp ? 'border-red-500' : ''}`}
                {...register('otp', { 
                  required: 'Verification OTP is required',
                  pattern: { value: /^\d{6}$/, message: 'OTP must be exactly 6 digits' }
                })}
              />
            </div>
            {errors.otp && <span className="text-xs text-red-500 mt-1 block">{errors.otp.message}</span>}
          </div>

          {/* New Password */}
          <div>
            <label className="custom-label">New Password</label>
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
            <label className="custom-label">Confirm New Password</label>
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
            Reset Password <ArrowRight size={18} />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
