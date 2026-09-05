'use client';
import React, { useState, useEffect } from 'react';
import WelcomeScreen from './WelcomeScreen';
import LoginScreen from './LoginScreen';
import VerifyOtpScreen from './VerifyOtpScreen';
import ProfileSetupModal from './ProfileSetupModal';
import HomeScreen from './HomeScreen';
import NotFound from '@/app/not-found';

export default function RoyalLudoMobileApp() {
  const [currentStep, setCurrentStep] = useState('welcome'); // 'welcome' | 'login' | 'verify_otp' | 'home'
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [isWebEnabled, setIsWebEnabled] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check web app master status continuously via AJAX for instant live shutdown
  useEffect(() => {
    const checkStatus = () => {
      fetch('/api/web-status?t=' + Date.now())
        .then(res => res.json())
        .then(data => {
          if (data && data.isWebGameEnabled === false) {
            setIsWebEnabled(false);
          } else if (data && data.isWebGameEnabled === true) {
            setIsWebEnabled(true);
          }
        })
        .catch(err => console.error(err));
    };

    checkStatus();
    const interval = setInterval(checkStatus, 2000);

    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUserData(token);
    }

    return () => clearInterval(interval);
  }, []);

  const fetchUserData = async (tokenStr) => {
    try {
      const authHeader = { 'Authorization': `Bearer ${tokenStr}` };
      
      const userRes = await fetch('/api/user/me', { headers: authHeader });
      const userData = await userRes.json();

      const walletRes = await fetch('/api/wallet/balance', { headers: authHeader });
      const walletData = await walletRes.json();

      if (userData.success && userData.data) {
        setUser(userData.data);
        if (walletData.success && walletData.data) {
          setWallet(walletData.data);
        }
        setCurrentStep('home');
      } else {
        // Expired token
        localStorage.removeItem('access_token');
        setCurrentStep('welcome');
      }
    } catch (e) {
      console.error(e);
      setCurrentStep('welcome');
    }
  };

  // Step 1: Send OTP with Password
  const handleSendOtp = async (phoneNum, userPassword) => {
    setIsSubmitting(true);
    setErrorMessage('');
    setMobileNumber(phoneNum);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneNum,
          country_code: '+91',
          password: userPassword
        })
      });
      const data = await res.json();

      if (data.success) {
        setOtpToken(data.data?.otp_token || '');
        setCurrentStep('verify_otp');
      } else {
        setErrorMessage(data.error?.message || 'Failed to send OTP');
      }
    } catch (e) {
      setErrorMessage('Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };


  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: mobileNumber })
      });
      const data = await res.json();
      if (data.success) {
        setOtpToken(data.data?.otp_token || '');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Step 3: Verify OTP & Password Setup
  const handleVerifyOtp = async ({ otp, password }) => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: mobileNumber,
          otp,
          otp_token: otpToken,
          password
        })
      });
      const data = await res.json();

      if (data.success) {
        if (data.data?.access_token) {
          localStorage.setItem('access_token', data.data.access_token);
        }

        const isNewUser = data.data?.is_new_user || data.data?.is_profile_pending;

        if (data.data?.user) {
          setUser(data.data.user);
        }

        if (isNewUser) {
          // Open profile creation modal for new registered users
          setShowProfileModal(true);
          setCurrentStep('home');
        } else {
          fetchUserData(data.data?.access_token);
        }
      } else {
        setErrorMessage(data.error?.message || 'OTP verification failed');
      }
    } catch (e) {
      setErrorMessage('Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save Profile (Username & Avatar selection)
  const handleSaveProfile = async ({ username, avatar_id }) => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/user/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ username, avatar_id })
      });
      const data = await res.json();

      if (data.success) {
        setShowProfileModal(false);
        if (token) fetchUserData(token);
      } else {
        setErrorMessage(data.error?.message || 'Failed to update profile');
      }
    } catch (e) {
      setErrorMessage('Failed to save profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    setWallet(null);
    setCurrentStep('welcome');
  };

  if (!isWebEnabled) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-[#070913] flex items-center justify-center p-0 md:p-4 selection:bg-yellow-400 selection:text-slate-950">
      {/* Mobile Shell Frame Container */}
      <div className="w-full max-w-[440px] min-h-screen md:min-h-[880px] bg-[#070913] md:rounded-[40px] md:border-[8px] md:border-slate-800 md:shadow-[0_0_60px_rgba(139,92,246,0.25)] relative overflow-hidden flex flex-col justify-between">
        
        {/* Render active screen */}
        {currentStep === 'welcome' && (
          <WelcomeScreen onGetStarted={() => setCurrentStep('login')} />
        )}

        {currentStep === 'login' && (
          <LoginScreen
            onSendOtp={handleSendOtp}
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
          />
        )}

        {currentStep === 'verify_otp' && (
          <VerifyOtpScreen
            mobileNumber={mobileNumber}
            onVerifyOtp={handleVerifyOtp}
            onResendOtp={handleResendOtp}
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
          />
        )}

        {currentStep === 'home' && (
          <HomeScreen
            user={user}
            wallet={wallet}
            onRefreshData={() => fetchUserData(localStorage.getItem('access_token'))}
            onOpenProfileSetup={() => setShowProfileModal(true)}
            onLogout={handleLogout}
          />
        )}

        {/* Profile Creation Modal for New Registered Users */}
        {showProfileModal && (
          <ProfileSetupModal
            initialUsername={user?.username || 'KingPlayer_01'}
            initialAvatarId={user?.avatar_id || 'av1'}
            onSaveProfile={handleSaveProfile}
            onClose={() => setShowProfileModal(false)}
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
          />
        )}

      </div>
    </div>
  );
}
