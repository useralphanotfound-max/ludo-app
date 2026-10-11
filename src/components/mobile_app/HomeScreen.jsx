'use client';
import React, { useState, useEffect } from 'react';
import {
  Headphones, Users, CreditCard, Gift, Trophy, ClipboardList,
  Pencil, History, Play, Wallet as WalletIcon, User, RefreshCw, X, Check,
  AlertCircle, Plus, BookOpen, Tag, LogOut, ChevronRight, QrCode, Copy
} from 'lucide-react';
import CreateRoomScreen from './CreateRoomScreen';
import RoomsTab from './RoomsTab';
import WalletTab from './WalletTab';
import ProfileTab from './ProfileTab';
import LeaderboardModal from './LeaderboardModal';

export default function HomeScreen({
  user,
  wallet,
  onRefreshData,
  onOpenProfileSetup,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState('play'); // 'play' | 'rooms' | 'wallet' | 'profile'
  const [subScreen, setSubScreen] = useState(null); // 'create_room' | null
  const [activeModal, setActiveModal] = useState(null); // 'deposit' | 'withdraw' | 'referrals' | 'scratch' | 'leaderboard' | 'tasks' | 'history' | 'support'
  const [modalData, setModalData] = useState(null);
  const [loadingModal, setLoadingModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Deposit state
  const [depositAmount, setDepositAmount] = useState('500');
  const [utrNumber, setUtrNumber] = useState('');
  const [submittingDeposit, setSubmittingDeposit] = useState(false);

  // Withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState('500');
  const [withdrawUpi, setWithdrawUpi] = useState('user@upi');
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);

  // UPI Info & Payment Methods state (for deposit modal)
  const [upiInfo, setUpiInfo] = useState(null);
  const [selectedMethodIndex, setSelectedMethodIndex] = useState(0);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Support ticket state
  const [ticketCategory, setTicketCategory] = useState('payment');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Room Create state
  const [submittingRoom, setSubmittingRoom] = useState(false);

  // Dynamic Feature Flags from Admin Panel Settings
  const [isLeaderboardEnabled, setIsLeaderboardEnabled] = useState(true);

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data?.success && data?.data) {
          if (typeof data.data.isLeaderboardEnabled === 'boolean') {
            setIsLeaderboardEnabled(data.data.isLeaderboardEnabled);
          } else if (typeof data.data.is_leaderboard_enabled === 'boolean') {
            setIsLeaderboardEnabled(data.data.is_leaderboard_enabled);
          }
        }
      })
      .catch(() => {});
  }, []);

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const authFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers
    };
    return fetch(url, { ...options, headers });
  };

  // Open modal and fetch respective API data
  const handleOpenModal = async (modalName) => {
    setActiveModal(modalName);
    setActionSuccess('');
    setActionError('');
    setLoadingModal(true);

    try {
      if (modalName === 'deposit') {
        // Fetch live UPI info & multiple payment methods for deposit
        const res = await fetch('/api/wallet/upi-info?t=' + Date.now());
        const data = await res.json();
        if (data.success) {
          setUpiInfo(data.data);
          setSelectedMethodIndex(0);
          setCopiedUpi(false);
        }
      } else if (modalName === 'referrals') {
        const res = await authFetch('/api/referral/info');
        const data = await res.json();
        if (data.success) setModalData(data.data);
      } else if (modalName === 'scratch') {
        const res = await authFetch('/api/scratch-cards');
        const data = await res.json();
        if (data.success) setModalData(data.data);
      } else if (modalName === 'tasks') {
        const res = await authFetch('/api/tasks');
        const data = await res.json();
        if (data.success) setModalData(data.data);
      } else if (modalName === 'history') {
        const res = await authFetch('/api/matches/history');
        const data = await res.json();
        if (data.success) setModalData(data.data);
      } else if (modalName === 'support') {
        const res = await authFetch('/api/support/contact');
        const data = await res.json();
        if (data.success) setModalData(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingModal(false);
    }
  };

  const [depositProofImage, setDepositProofImage] = useState(null);
  const [depositProofFile, setDepositProofFile] = useState(null);
  const [depositProofPreview, setDepositProofPreview] = useState(null);

  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setDepositProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setDepositProofImage(reader.result);
        setDepositProofPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Deposit confirm submit via FormData (multipart/form-data)
  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    setSubmittingDeposit(true);
    setActionError('');
    setActionSuccess('');

    try {
      const activeMethod = upiInfo?.methods?.[selectedMethodIndex] || (upiInfo?.methods && upiInfo.methods[0]);
      const formData = new FormData();
      formData.append('amount', depositAmount);
      formData.append('utr_number', utrNumber.trim());
      if (activeMethod) {
        formData.append('method_id', activeMethod.id || activeMethod._id || '');
        formData.append('payment_method', activeMethod.type || 'UPI');
        formData.append('method_name', activeMethod.name || 'UPI Direct');
      }
      if (depositProofFile) {
        formData.append('proof_image', depositProofFile);
      } else if (depositProofImage) {
        formData.append('proof_image_url', depositProofImage);
      }

      const headers = {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      const res = await fetch('/api/wallet/deposit/confirm', {
        method: 'POST',
        headers,
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(data.message || `Deposit request of ₹${depositAmount} submitted successfully!`);
        setUtrNumber('');
        setDepositProofFile(null);
        setDepositProofImage(null);
        setDepositProofPreview(null);
        if (onRefreshData) onRefreshData();
      } else {
        setActionError(data.error?.message || 'Failed to submit deposit');
      }
    } catch (err) {
      setActionError('Network error occurred');
    } finally {
      setSubmittingDeposit(false);
    }
  };

  // Withdraw submit
  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setSubmittingWithdraw(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await authFetch('/api/wallet/withdraw/initiate', {
        method: 'POST',
        body: JSON.stringify({
          amount: Number(withdrawAmount),
          withdrawal_method: 'upi',
          upi_id: withdrawUpi.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(data.message || 'Withdrawal request submitted successfully');
        if (onRefreshData) onRefreshData();
      } else {
        setActionError(data.error?.message || 'Withdrawal failed');
      }
    } catch (err) {
      setActionError('Network error occurred');
    } finally {
      setSubmittingWithdraw(false);
    }
  };

  // Claim Task
  const handleClaimTask = async (taskId) => {
    try {
      const res = await authFetch(`/api/tasks/${taskId}/claim`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(data.message);
        handleOpenModal('tasks');
        if (onRefreshData) onRefreshData();
      } else {
        setActionError(data.error?.message);
      }
    } catch (e) {
      setActionError('Failed to claim reward');
    }
  };

  // Scratch Card
  const handleScratchCard = async (cardId) => {
    try {
      const res = await authFetch(`/api/scratch-cards/${cardId}/scratch`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(data.message);
        handleOpenModal('scratch');
        if (onRefreshData) onRefreshData();
      } else {
        setActionError(data.error?.message);
      }
    } catch (e) {
      setActionError('Failed to scratch card');
    }
  };

  // Submit Support Ticket
  const handleSupportTicketSubmit = async (e) => {
    e.preventDefault();
    setSubmittingTicket(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await authFetch('/api/support/ticket', {
        method: 'POST',
        body: JSON.stringify({
          category: ticketCategory,
          subject: ticketSubject.trim(),
          message: ticketMessage.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess('Support ticket created successfully! Ticket ID: ' + data.data?.ticket_id);
        setTicketSubject('');
        setTicketMessage('');
      } else {
        setActionError(data.error?.message);
      }
    } catch (e) {
      setActionError('Failed to submit ticket');
    } finally {
      setSubmittingTicket(false);
    }
  };

  // Create Room
  const handleCreateRoom = async (roomPayload) => {
    setSubmittingRoom(true);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await authFetch('/api/rooms/create', {
        method: 'POST',
        body: JSON.stringify(roomPayload)
      });
      const data = await res.json();
      if (data.success) {
        setSubScreen(null);
        setActiveTab('rooms');
        if (onRefreshData) onRefreshData();
      } else {
        setActionError(data.error?.message || 'Room creation failed');
      }
    } catch (e) {
      setActionError('Failed to create room');
    } finally {
      setSubmittingRoom(false);
    }
  };

  const totalBalance = wallet?.total_balance ?? wallet?.balance ?? 2500;
  const username = user?.username || 'KingPlayer_01';

  // Sub-screens override main view
  if (subScreen === 'create_room') {
    return (
      <CreateRoomScreen
        userBalance={totalBalance}
        onBack={() => setSubScreen(null)}
        onCreateRoom={handleCreateRoom}
        isSubmitting={submittingRoom}
        errorMessage={actionError}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#070913] text-white relative pb-20 overflow-x-hidden">
      
      {/* RENDER TAB 1: PLAY (DASHBOARD) */}
      {activeTab === 'play' && (
        <>
          {/* Top Header Bar */}
          <header className="flex items-center justify-between p-4 bg-[#0d111d]/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30">
            <div className="flex items-center gap-3 cursor-pointer" onClick={onOpenProfileSetup}>
              <div className="w-10 h-10 rounded-full ring-2 ring-yellow-400 p-0.5 bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                <div className="w-full h-full rounded-full bg-[#1b2236] flex items-center justify-center text-base font-black">
                  🤴
                </div>
              </div>
              <span className="font-bold text-base text-purple-200 tracking-tight hover:text-white transition-colors">
                {username}
              </span>
            </div>

            <button
              onClick={() => handleOpenModal('support')}
              className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Support"
            >
              <Headphones className="w-5 h-5" />
            </button>
          </header>

          {/* Main Dashboard Content */}
          <main className="p-4 space-y-4 max-w-md mx-auto w-full">
            {/* 1. Available Balance Card */}
            <div className="bg-[#121623] border border-slate-800/80 rounded-3xl p-4 flex items-center justify-between shadow-xl shadow-purple-950/20">
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1">Available Balance</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-md shadow-amber-400/30">
                    ₹
                  </div>
                  <span className="text-2xl font-extrabold text-white tracking-tight">
                    {Number(totalBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleOpenModal('deposit')}
                className="py-2.5 px-6 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-yellow-500/20 hover:scale-105 active:scale-95 transition-all border border-yellow-300/40"
              >
                Deposit
              </button>
            </div>

            {/* 2. Big Purple Play Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-800 via-indigo-700 to-purple-900 border border-purple-500/40 p-5 shadow-2xl shadow-purple-900/40">
              <div className="absolute right-0 bottom-0 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between relative z-10">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 via-amber-500 to-red-500 rounded-2xl p-1 shadow-xl flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform">
                  <div className="w-full h-full bg-[#111624] rounded-xl flex items-center justify-center p-1.5">
                    <div className="grid grid-cols-2 gap-1.5 w-14 h-14">
                      <div className="bg-red-500 rounded-md shadow-md" />
                      <div className="bg-green-500 rounded-md shadow-md" />
                      <div className="bg-blue-500 rounded-md shadow-md" />
                      <div className="bg-yellow-400 rounded-md shadow-md" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end text-right">
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-3 text-[10px] font-bold tracking-wider uppercase">
                    <span className="text-cyan-300 flex items-center gap-1 justify-end">
                      ❄ CLASSIC
                    </span>
                    <span className="text-amber-300 flex items-center gap-1 justify-end opacity-60">
                      🚀 TURBO
                    </span>
                    <span className="text-yellow-300 flex items-center gap-1 justify-end opacity-60">
                      👑 LUDO KING
                    </span>
                    <span className="text-pink-300 flex items-center gap-1 justify-end opacity-60">
                      ⌛ QUICK
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveTab('rooms')}
                    className="py-3 px-8 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-yellow-500/30 hover:scale-105 active:scale-95 transition-all border border-yellow-300/50 uppercase tracking-wider"
                  >
                    PLAY NOW
                  </button>
                </div>
              </div>
            </div>

            {/* 3. 3x3 Grid Menu Items */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <button
                onClick={() => handleOpenModal('referrals')}
                className="flex flex-col items-center justify-center p-4 bg-[#121623] border border-slate-800/80 rounded-2xl hover:border-purple-500/40 hover:bg-slate-800/50 transition-all group shadow-md"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-200">Referrals</span>
              </button>

              <button
                onClick={() => handleOpenModal('deposit')}
                className="flex flex-col items-center justify-center p-4 bg-[#121623] border border-slate-800/80 rounded-2xl hover:border-purple-500/40 hover:bg-slate-800/50 transition-all group shadow-md"
              >
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <div className="w-6 h-6 rounded-full border-2 border-yellow-400 flex items-center justify-center font-black text-xs">₹</div>
                </div>
                <span className="text-xs font-bold text-slate-200">Deposit</span>
              </button>

              <button
                onClick={() => handleOpenModal('withdraw')}
                className="flex flex-col items-center justify-center p-4 bg-[#121623] border border-slate-800/80 rounded-2xl hover:border-purple-500/40 hover:bg-slate-800/50 transition-all group shadow-md"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-200">Withdraw</span>
              </button>

              <button
                onClick={() => handleOpenModal('scratch')}
                className="flex flex-col items-center justify-center p-4 bg-[#121623] border border-slate-800/80 rounded-2xl hover:border-purple-500/40 hover:bg-slate-800/50 transition-all group shadow-md"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Gift className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-200">Scratch Cards</span>
              </button>

              <button
                onClick={() => handleOpenModal('leaderboard')}
                className="flex flex-col items-center justify-center p-4 bg-[#121623] border border-slate-800/80 rounded-2xl hover:border-purple-500/40 hover:bg-slate-800/50 transition-all group shadow-md"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Trophy className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-200">Leaderboard</span>
              </button>

              <button
                onClick={() => handleOpenModal('tasks')}
                className="flex flex-col items-center justify-center p-4 bg-[#121623] border border-slate-800/80 rounded-2xl hover:border-purple-500/40 hover:bg-slate-800/50 transition-all group shadow-md"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-200">Tasks</span>
              </button>

              <button
                onClick={onOpenProfileSetup}
                className="flex flex-col items-center justify-center p-4 bg-[#121623] border border-slate-800/80 rounded-2xl hover:border-purple-500/40 hover:bg-slate-800/50 transition-all group shadow-md"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Pencil className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-200">Change Name</span>
              </button>

              <button
                onClick={() => handleOpenModal('history')}
                className="flex flex-col items-center justify-center p-4 bg-[#121623] border border-slate-800/80 rounded-2xl hover:border-purple-500/40 hover:bg-slate-800/50 transition-all group shadow-md"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <History className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-200">History</span>
              </button>

              <button
                onClick={() => handleOpenModal('support')}
                className="flex flex-col items-center justify-center p-4 bg-[#121623] border border-slate-800/80 rounded-2xl hover:border-purple-500/40 hover:bg-slate-800/50 transition-all group shadow-md"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Headphones className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-200">Support</span>
              </button>
            </div>
          </main>
        </>
      )}

      {/* RENDER TAB 2: ROOMS */}
      {activeTab === 'rooms' && (
        <RoomsTab
          user={user}
          wallet={wallet}
          onOpenCreateRoom={() => setSubScreen('create_room')}
          onRefreshData={onRefreshData}
        />
      )}

      {/* RENDER TAB 3: WALLET */}
      {activeTab === 'wallet' && (
        <WalletTab
          wallet={wallet}
          onOpenDeposit={() => handleOpenModal('deposit')}
          onOpenWithdraw={() => handleOpenModal('withdraw')}
          onOpenSupport={() => handleOpenModal('support')}
          onBack={() => setActiveTab('play')}
        />
      )}

      {/* RENDER TAB 4: PROFILE */}
      {activeTab === 'profile' && (
        <ProfileTab
          user={user}
          wallet={wallet}
          onOpenEditProfile={onOpenProfileSetup}
          onOpenReferrals={() => handleOpenModal('referrals')}
          onOpenSupport={() => handleOpenModal('support')}
          onLogout={onLogout}
        />
      )}

      {/* Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0d17]/95 backdrop-blur-lg border-t border-slate-800/80 px-4 py-2.5 z-40">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
          {/* Play */}
          <button
            onClick={() => { setActiveTab('play'); setSubScreen(null); }}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-full transition-all ${
              activeTab === 'play'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span className="text-xs">Play</span>
          </button>

          {/* Rooms */}
          <button
            onClick={() => { setActiveTab('rooms'); setSubScreen(null); }}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'rooms' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">Rooms</span>
          </button>

          {/* Wallet */}
          <button
            onClick={() => { setActiveTab('wallet'); setSubScreen(null); }}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'wallet' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <WalletIcon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">Wallet</span>
          </button>

          {/* Profile */}
          <button
            onClick={() => { setActiveTab('profile'); setSubScreen(null); }}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              activeTab === 'profile' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>

      {/* ================= LEADERBOARD MODAL ================= */}
      {activeModal === 'leaderboard' && (
        <LeaderboardModal onClose={() => setActiveModal(null)} />
      )}

      {/* ================= OTHER MODALS OVERLAY ================= */}
      {activeModal && activeModal !== 'leaderboard' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-[#121623] border border-slate-700/80 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative text-white max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Messages */}
            {actionSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{actionSuccess}</span>
              </div>
            )}
            {actionError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{actionError}</span>
              </div>
            )}

            {/* DEPOSIT MODAL */}
            {activeModal === 'deposit' && (
              (() => {
                const paymentMethods = upiInfo?.methods || [];
                const activeMethod = paymentMethods[selectedMethodIndex] || {
                  name: 'UPI Direct Transfer',
                  type: 'UPI',
                  upi_id: upiInfo?.upi_id || 'royalludo@upi',
                  qr_image_url: upiInfo?.qr_code || '',
                  payee_name: upiInfo?.payee_name || 'Royal Ludo Gaming'
                };
                const isQr = activeMethod.type === 'QR_CODE' || (!activeMethod.upi_id && activeMethod.qr_image_url);
                const qrDisplay = activeMethod.qr_image_url || (activeMethod.upi_id ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=${encodeURIComponent(activeMethod.upi_id)}&pn=${encodeURIComponent(activeMethod.payee_name || 'Royal Ludo')}&cu=INR` : upiInfo?.qr_code);

                return (
                  <div>
                    <h3 className="text-xl font-bold mb-1">Add Money to Wallet</h3>
                    <p className="text-xs text-slate-400 mb-3">Select your deposit method, make payment, and submit UTR.</p>

                    {/* Multiple Payment Methods Selector Tabs */}
                    {paymentMethods.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
                        {paymentMethods.map((m, idx) => (
                          <button
                            key={m.id || m._id || idx}
                            type="button"
                            onClick={() => {
                              setSelectedMethodIndex(idx);
                              setCopiedUpi(false);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                              selectedMethodIndex === idx
                                ? 'bg-amber-400/20 text-yellow-300 border-amber-400/50 shadow-md'
                                : 'bg-[#0d111d] text-slate-400 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {m.type === 'QR_CODE' ? <QrCode className="w-3.5 h-3.5" /> : <CreditCard className="w-3.5 h-3.5" />}
                            {m.name || `Method ${idx + 1}`}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Active Method Details Box */}
                    <div className="bg-[#0d111d] p-4 rounded-2xl border border-slate-800 mb-4 text-center">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                          {isQr ? <QrCode className="w-3.5 h-3.5" /> : <CreditCard className="w-3.5 h-3.5" />}
                          {activeMethod.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Payee: <strong className="text-white">{activeMethod.payee_name || upiInfo?.payee_name || 'Royal Ludo'}</strong>
                        </span>
                      </div>

                      {/* QR Code Image */}
                      {qrDisplay && (
                        <div className="mb-3">
                          <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl flex items-center justify-center shadow-lg border border-slate-200">
                            <img
                              src={qrDisplay}
                              alt="Scan QR to Pay"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 block">Scan QR Code using PhonePe / GooglePay / Paytm</span>
                        </div>
                      )}

                      {/* UPI ID Pill with Copy Button */}
                      {activeMethod.upi_id && (
                        <div className="bg-[#080b14] border border-slate-700/80 rounded-xl px-3 py-2 flex items-center justify-between">
                          <div className="text-left">
                            <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider block">ADMIN UPI ID</span>
                            <span className="text-xs font-extrabold text-amber-300 font-mono">{activeMethod.upi_id}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(activeMethod.upi_id);
                              setCopiedUpi(true);
                              setTimeout(() => setCopiedUpi(false), 2000);
                            }}
                            className="px-2.5 py-1 bg-amber-400/20 text-yellow-300 hover:bg-amber-400/30 border border-amber-400/30 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                          >
                            {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedUpi ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      )}

                      {activeMethod.instructions && (
                        <p className="text-[10px] text-slate-400 mt-2 text-left">
                          {activeMethod.instructions}
                        </p>
                      )}
                    </div>

                    <form onSubmit={handleDepositSubmit} className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-semibold text-slate-300">Deposit Amount (₹)</label>
                          <span className="text-[10px] text-slate-400">Min ₹{activeMethod.min_amount || upiInfo?.min_deposit || 50}</span>
                        </div>

                        {/* Quick preset chips */}
                        <div className="grid grid-cols-4 gap-1.5 mb-2">
                          {['100', '200', '500', '1000'].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setDepositAmount(amt)}
                              className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                                depositAmount === amt
                                  ? 'bg-amber-400 text-slate-950 border-amber-400'
                                  : 'bg-[#0a0d17] text-slate-300 border-slate-700 hover:border-slate-600'
                              }`}
                            >
                              ₹{amt}
                            </button>
                          ))}
                        </div>

                        <input
                          type="number"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="w-full px-4 py-2.5 bg-[#0a0d17] border border-slate-700 rounded-xl text-white font-bold text-base focus:outline-none focus:border-yellow-400"
                          min="10"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">UTR / Transaction ID *</label>
                        <input
                          type="text"
                          value={utrNumber}
                          onChange={(e) => setUtrNumber(e.target.value)}
                          placeholder="Enter 12-digit UPI UTR number"
                          className="w-full px-4 py-2.5 bg-[#0a0d17] border border-slate-700 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-yellow-400 font-mono"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Upload Payment Screenshot Proof</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleScreenshotChange}
                          className="w-full text-xs text-slate-400 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-900/50 file:text-purple-300 hover:file:bg-purple-900 bg-[#0a0d17] border border-slate-700 rounded-xl cursor-pointer"
                        />
                        {depositProofPreview && (
                          <div className="mt-2 relative w-20 h-20 rounded-xl overflow-hidden border border-yellow-400/50">
                            <img src={depositProofPreview} alt="Screenshot Proof" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={submittingDeposit || !utrNumber}
                        className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-bold rounded-xl shadow-lg hover:scale-105 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                      >
                        {submittingDeposit ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> Submitting Request...
                          </>
                        ) : (
                          `Submit Deposit Request (₹${depositAmount})`
                        )}
                      </button>
                    </form>
                  </div>
                );
              })()
            )}

            {/* WITHDRAW MODAL */}
            {activeModal === 'withdraw' && (
              <div>
                <h3 className="text-xl font-bold mb-1">Withdraw Funds</h3>
                <p className="text-xs text-slate-400 mb-4">Transfer winning balance directly to your UPI ID.</p>

                <div className="bg-[#0d111d] p-3 rounded-xl border border-slate-800 mb-4 flex justify-between items-center">
                  <span className="text-xs text-slate-400">Available Withdrawal</span>
                  <span className="text-sm font-bold text-emerald-400">₹{(wallet?.winning_balance || 1850).toFixed(2)}</span>
                </div>

                <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Withdrawal Amount (₹)</label>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0a0d17] border border-slate-700 rounded-xl text-white font-bold text-base focus:outline-none focus:border-yellow-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Your UPI ID</label>
                    <input
                      type="text"
                      value={withdrawUpi}
                      onChange={(e) => setWithdrawUpi(e.target.value)}
                      placeholder="username@upi"
                      className="w-full px-4 py-3 bg-[#0a0d17] border border-slate-700 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-yellow-400"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingWithdraw}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-bold rounded-xl shadow-lg hover:scale-105 disabled:opacity-50 transition-all"
                  >
                    {submittingWithdraw ? 'Processing...' : 'Submit Withdrawal'}
                  </button>
                </form>
              </div>
            )}

            {/* REFERRALS MODAL */}
            {activeModal === 'referrals' && (
              <div>
                <h3 className="text-xl font-bold mb-1">Refer & Earn</h3>
                <p className="text-xs text-slate-400 mb-4">Earn ₹50 bonus for every friend who joins!</p>

                <div className="bg-[#0d111d] p-4 rounded-2xl border border-slate-800 mb-4 text-center space-y-2">
                  <span className="text-xs text-slate-400 block">Your Referral Code</span>
                  <span className="text-2xl font-black text-yellow-400 tracking-wider block">{modalData?.referral_code || 'PEDDI50'}</span>
                  <span className="text-[10px] text-slate-500 block">Total Earned: ₹{(modalData?.total_earned || 600).toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* TASKS MODAL */}
            {activeModal === 'tasks' && (
              <div>
                <h3 className="text-xl font-bold mb-1">Daily Missions</h3>
                <p className="text-xs text-slate-400 mb-4">Complete daily tasks to claim cash & bonus coins.</p>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {modalData?.tasks?.map((t) => (
                    <div key={t.id} className="p-3 bg-[#0d111d] border border-slate-800 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">{t.title}</span>
                        <span className="text-[10px] text-amber-400 font-semibold">Reward: ₹{t.reward} ({t.reward_type})</span>
                      </div>
                      <button
                        onClick={() => handleClaimTask(t.id)}
                        disabled={t.is_claimed || !t.is_completed}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold ${
                          t.is_claimed
                            ? 'bg-slate-800 text-slate-500'
                            : t.is_completed
                            ? 'bg-amber-400 text-slate-950 shadow'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {t.is_claimed ? 'Claimed' : 'Claim'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SCRATCH CARDS MODAL */}
            {activeModal === 'scratch' && (
              <div>
                <h3 className="text-xl font-bold mb-1">Scratch Cards</h3>
                <p className="text-xs text-slate-400 mb-4">Scratch to reveal your instant bonus rewards.</p>

                <div className="space-y-3">
                  {modalData?.available_cards?.map((card) => (
                    <div key={card.id} className="p-4 bg-[#0d111d] border border-slate-800 rounded-2xl flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold text-yellow-300 block">{card.name}</span>
                        <span className="text-xs text-slate-400">Tap scratch to reveal reward</span>
                      </div>
                      <button
                        onClick={() => handleScratchCard(card.id)}
                        className="py-2 px-4 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-bold text-xs rounded-xl shadow"
                      >
                        Scratch
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HISTORY MODAL */}
            {activeModal === 'history' && (
              <div>
                <h3 className="text-xl font-bold mb-1">Match History</h3>
                <p className="text-xs text-slate-400 mb-4">Your recent Ludo match results.</p>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {modalData?.matches?.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">No matches played yet.</p>
                  ) : (
                    modalData?.matches?.map((m, idx) => (
                      <div key={idx} className="p-3 bg-[#0d111d] border border-slate-800 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-white block">Room #{m.room_code}</span>
                          <span className="text-[10px] text-slate-400">Entry: ₹{m.entry_fee}</span>
                        </div>
                        <span className={`text-xs font-bold ${m.my_result === 'WON' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {m.my_result} (+₹{m.prize_won})
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* SUPPORT MODAL */}
            {activeModal === 'support' && (
              <div>
                <h3 className="text-xl font-bold mb-1">Customer Support</h3>
                <p className="text-xs text-slate-400 mb-4">We are here to help 24/7.</p>

                <form onSubmit={handleSupportTicketSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0a0d17] border border-slate-700 rounded-xl text-white text-xs"
                    >
                      <option value="payment">Payment / Deposit</option>
                      <option value="match_dispute">Match Dispute</option>
                      <option value="account">Account</option>
                      <option value="technical">Technical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                    <input
                      type="text"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="Brief topic"
                      className="w-full px-3 py-2 bg-[#0a0d17] border border-slate-700 rounded-xl text-white text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Message</label>
                    <textarea
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      placeholder="Describe your issue..."
                      rows={3}
                      className="w-full px-3 py-2 bg-[#0a0d17] border border-slate-700 rounded-xl text-white text-xs"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingTicket}
                    className="w-full py-2.5 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow"
                  >
                    {submittingTicket ? 'Submitting...' : 'Submit Support Ticket'}
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
