'use client';
import React, { useState, useEffect } from 'react';
import { CheckCircle, Mail, AlertCircle } from 'lucide-react';

export default function VerifyOtpScreen({
  mobileNumber,
  onVerifyOtp,
  onResendOtp,
  isSubmitting,
  errorMessage
}) {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = () => {
    if (!canResend) return;
    setTimer(59);
    setCanResend(false);
    onResendOtp();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (otp.length !== 4) {
      setValidationError('Please enter a valid 4-digit OTP code');
      return;
    }

    onVerifyOtp({ otp });
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#070913] text-white justify-between items-center p-5 sm:p-6 relative overflow-y-auto">
      <div className="w-full max-w-sm my-auto pt-6 pb-6">
        
        {/* Header Title */}
        <h2 className="text-3xl font-extrabold text-center text-white mb-2 tracking-tight">
          Verify OTP
        </h2>
        <p className="text-xs text-slate-400 text-center mb-8 px-2 leading-relaxed">
          Verify the OTP code sent to your mobile number <span className="text-purple-300 font-semibold">+91 {mobileNumber}</span>.
        </p>

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Enter OTP Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Enter OTP
            </label>
            <div className="relative flex items-center bg-[#121623] border border-slate-700/80 rounded-2xl overflow-hidden focus-within:border-yellow-400 focus-within:ring-2 focus-within:ring-yellow-400/20 transition-all">
              <div className="pl-3.5 text-purple-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="Enter OTP"
                className="w-full pl-3 pr-28 py-3.5 bg-transparent text-white font-black tracking-widest text-lg focus:outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-500"
                maxLength={4}
                disabled={isSubmitting}
                autoComplete="off"
              />
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend || isSubmitting}
                className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Send OTP
              </button>
            </div>
          </div>

          {/* Errors */}
          {(validationError || errorMessage) && (
            <div className="flex items-center gap-1.5 text-xs text-rose-400 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError || errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || otp.length !== 4}
            className="w-full py-4 px-6 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-extrabold text-base rounded-2xl shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer border border-yellow-300/40 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            <span>{isSubmitting ? 'Verifying...' : 'Verify'}</span>
            <CheckCircle className="w-5 h-5" />
          </button>
        </form>

        {/* Resend Code Footer */}
        <div className="mt-6 text-center space-y-1">
          <p className="text-xs text-slate-400">
            Resend code in <span className="text-purple-400 font-bold">{formatTimer(timer)}</span>
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend || isSubmitting}
            className="text-xs text-purple-400 font-bold hover:text-purple-300 hover:underline disabled:opacity-40 disabled:no-underline transition-colors"
          >
            Resend code
          </button>
        </div>

      </div>
    </div>
  );
}
