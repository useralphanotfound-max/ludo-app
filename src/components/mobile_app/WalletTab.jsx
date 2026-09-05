'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, CreditCard, ShieldCheck, ChevronRight, HelpCircle, Trophy, Gamepad2, Landmark } from 'lucide-react';

export default function WalletTab({
  wallet,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenSupport,
  onBack
}) {
  const [transactions, setTransactions] = useState([]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  useEffect(() => {
    if (token) {
      fetch('/api/wallet/transactions?limit=10', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data?.transactions) {
            setTransactions(data.data.transactions);
          }
        })
        .catch(console.error);
    }
  }, [token]);

  const totalBalance = wallet?.total_balance ?? wallet?.balance ?? 2500;
  const withdrawalBalance = wallet?.withdrawal_balance ?? wallet?.winning_balance ?? 1850;
  const bonusBalance = wallet?.bonus_balance ?? 450;
  const pendingBalance = wallet?.pending_balance ?? 200;

  return (
    <div className="flex flex-col min-h-screen bg-[#070913] text-white p-4 pb-24 relative overflow-y-auto">
      
      {/* Top Header */}
      <div className="flex items-center gap-3 mb-6 pt-2">
        {onBack && (
          <button onClick={onBack} className="text-white hover:text-yellow-400">
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Wallet</h1>
      </div>

      {/* Main Purple Balance Card */}
      <div className="bg-gradient-to-br from-purple-700 via-indigo-600 to-purple-900 border border-purple-400/40 rounded-3xl p-6 shadow-2xl shadow-purple-900/40 text-center mb-6 relative overflow-hidden">
        <span className="text-xs font-semibold text-purple-200 uppercase tracking-widest block mb-1">Total Balance</span>
        <h2 className="text-4xl font-black text-white tracking-tight mb-4">
          ₹{Number(totalBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </h2>

        <div className="inline-flex items-center gap-1.5 py-1.5 px-4 bg-purple-950/60 border border-purple-400/30 rounded-full text-xs font-bold text-purple-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Secured by Royal Vault</span>
        </div>
      </div>

      {/* Row Buttons: + Deposit & Withdraw */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={onOpenDeposit}
          className="py-4 px-6 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-yellow-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-yellow-300/40"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span>Deposit</span>
        </button>

        <button
          onClick={onOpenWithdraw}
          className="py-4 px-6 bg-[#121623] border border-purple-500/50 text-purple-300 font-extrabold text-base rounded-2xl shadow-lg hover:bg-purple-950/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <CreditCard className="w-5 h-5" />
          <span>Withdraw</span>
        </button>
      </div>

      {/* WITHDRAWAL AMOUNT Card */}
      <div className="bg-[#121623] border border-slate-800/80 rounded-2xl p-5 mb-4 shadow-md">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">WITHDRAWAL AMOUNT</span>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-black text-white">
            ₹{Number(withdrawalBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] font-medium text-slate-400">Available for immediate payout</span>
        </div>
      </div>

      {/* Grid: BONUS & PENDING */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-[#121623] border border-slate-800/80 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">BONUS</span>
          <span className="text-xl font-extrabold text-white">
            ₹{Number(bonusBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-[#121623] border border-slate-800/80 rounded-2xl p-4 shadow-md">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">PENDING</span>
          <span className="text-xl font-extrabold text-white">
            ₹{Number(pendingBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-extrabold text-white tracking-tight">Recent Transactions</h3>
          <button className="text-xs font-bold text-amber-400 hover:text-amber-300">View All</button>
        </div>

        <div className="space-y-2">
          {transactions.length === 0 ? (
            /* Mock default list matching Image 3 */
            <>
              <div className="bg-[#121623] border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block leading-tight">Match Win</span>
                    <span className="text-[10px] text-slate-500 font-medium">24 Oct, 11:45 AM</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-400 block">+₹180.00</span>
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">SUCCESS</span>
                </div>
              </div>

              <div className="bg-[#121623] border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block leading-tight">Match Entry</span>
                    <span className="text-[10px] text-slate-500 font-medium">24 Oct, 11:15 AM</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-slate-300 block">-₹100.00</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">DEBITED</span>
                </div>
              </div>

              <div className="bg-[#121623] border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block leading-tight">Deposit</span>
                    <span className="text-[10px] text-slate-500 font-medium">23 Oct, 09:30 PM</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-400 block">+₹500.00</span>
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">SUCCESS</span>
                </div>
              </div>
            </>
          ) : (
            transactions.map((t) => (
              <div key={t.id} className="bg-[#121623] border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-white block">{t.title}</span>
                  <span className="text-[10px] text-slate-500">{new Date(t.created_at).toLocaleString()}</span>
                </div>
                <span className={`text-sm font-black ${t.is_credit ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {t.is_credit ? '+' : '-'}₹{t.amount?.toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Help Banner */}
      <button
        onClick={onOpenSupport}
        className="w-full bg-[#121623] border border-slate-800/80 hover:border-amber-500/40 rounded-2xl p-4 flex items-center justify-between text-left transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Need help with payment?</span>
            <span className="text-[10px] text-slate-400">Contact our 24/7 support team</span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
      </button>

    </div>
  );
}
