'use client';
import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Award, Headphones, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginScreen({ onSendOtp, isSubmitting, errorMessage }) {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(val);
    if (validationError) setValidationError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (mobileNumber.length !== 10) {
      setValidationError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!password || password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Create Password and Verify Password do not match');
      return;
    }

    onSendOtp(mobileNumber, password);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#070913] text-white justify-between items-center p-5 sm:p-6 relative overflow-y-auto">
      {/* Subtle Background Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-purple-900/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm my-auto pt-6 pb-6">
        {/* Login Card */}
        <div className="bg-[#121623]/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-2xl shadow-purple-950/20 relative">
          
          {/* Logo Graphic */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-2xl p-1.5 shadow-lg shadow-yellow-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#0d111d] rounded-xl flex flex-col items-center justify-center">
                <div className="grid grid-cols-2 gap-1 w-8 h-8 mb-0.5">
                  <div className="w-3.5 h-3.5 bg-red-500 rounded-sm" />
                  <div className="w-3.5 h-3.5 bg-green-500 rounded-sm" />
                  <div className="w-3.5 h-3.5 bg-blue-500 rounded-sm" />
                  <div className="w-3.5 h-3.5 bg-yellow-400 rounded-sm" />
                </div>
                <span className="text-[8px] text-yellow-400 font-extrabold tracking-tighter">ROYAL LUDO</span>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-white mb-1.5">Login / Register</h2>
          <p className="text-xs text-slate-400 text-center mb-6">
            Enter your mobile number and set your account password.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Mobile Number Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mobile Number
              </label>
              <div className="flex items-center bg-[#1a2030] border border-slate-700/80 rounded-2xl overflow-hidden focus-within:border-yellow-400 focus-within:ring-2 focus-within:ring-yellow-400/20 transition-all">
                <span className="px-4 py-3.5 text-sm font-bold text-purple-300 border-r border-slate-700/80 bg-slate-800/40">
                  +91
                </span>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={handleNumberChange}
                  placeholder="88888 88888"
                  className="w-full px-4 py-3.5 bg-transparent text-white font-medium text-sm focus:outline-none placeholder:text-slate-500 tracking-wider"
                  maxLength={10}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Create Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Create Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password (min 6 chars)"
                  className="w-full pl-10 pr-10 py-3.5 bg-[#1a2030] border border-slate-700/80 rounded-2xl text-white font-medium text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all placeholder:text-slate-500"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Verify Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Verify Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password to verify"
                  className="w-full pl-10 pr-10 py-3.5 bg-[#1a2030] border border-slate-700/80 rounded-2xl text-white font-medium text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all placeholder:text-slate-500"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Messages */}
            {(validationError || errorMessage) && (
              <div className="flex items-center gap-1.5 text-xs text-rose-400 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError || errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || mobileNumber.length !== 10 || !password || password !== confirmPassword}
              className="w-full py-4 px-6 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-bold text-base rounded-2xl shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-yellow-300/40"
            >
              <span>{isSubmitting ? 'Sending OTP...' : 'Send OTP'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-3 gap-2 mt-8 text-center">
          <div className="flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-1.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">SECURE</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-1.5">
              <Award className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">FAIR PLAY</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-1.5">
              <Headphones className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">24/7 SUPPORT</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400 space-x-2 font-medium">
            <button className="hover:text-purple-300 transition-colors">Terms of Service</button>
            <span>•</span>
            <button className="hover:text-purple-300 transition-colors">Privacy Policy</button>
          </p>
          <p className="text-[10px] text-slate-600 mt-2 uppercase tracking-widest font-semibold">
            © 2024 ROYAL LUDO GAMES LTD.
          </p>
        </div>
      </div>
    </div>
  );
}
