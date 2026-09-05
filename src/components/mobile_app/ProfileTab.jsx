'use client';
import React from 'react';
import { Pencil, Tag, BookOpen, Headphones, LogOut, ChevronRight } from 'lucide-react';

export default function ProfileTab({
  user,
  wallet,
  onOpenEditProfile,
  onOpenReferrals,
  onOpenSupport,
  onLogout
}) {
  const username = user?.username || 'KingPlayer_01';
  const gamesPlayed = user?.stats?.games_played ?? 142;
  const wins = user?.stats?.wins ?? 85;
  const winRate = gamesPlayed > 0 ? ((wins / gamesPlayed) * 100).toFixed(0) : '60';
  const balance = wallet?.total_balance ?? wallet?.balance ?? 1250;

  return (
    <div className="flex flex-col min-h-screen bg-[#070913] text-white p-4 pb-24 relative overflow-y-auto">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6 pt-2">
        <h1 className="text-2xl font-extrabold text-purple-400 tracking-tight">Royal Ludo</h1>
        <div className="flex items-center gap-1.5 py-1.5 px-4 bg-[#121623] border border-slate-800 rounded-full">
          <span className="text-sm font-black text-white">{Number(balance).toLocaleString('en-IN')}</span>
          <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">🪙</div>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-[#121623] border border-slate-800/80 rounded-3xl p-6 mb-6 text-center shadow-xl shadow-purple-950/20 relative">
        {/* Avatar Ring */}
        <div className="relative inline-block mb-3">
          <div className="w-24 h-24 rounded-full ring-4 ring-yellow-400 ring-offset-4 ring-offset-[#121623] bg-gradient-to-br from-amber-500 to-yellow-400 p-1 shadow-xl flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-[#1b2236] flex items-center justify-center text-3xl font-black">
              🤴
            </div>
          </div>
          <button
            onClick={onOpenEditProfile}
            className="absolute bottom-0 right-0 w-7 h-7 bg-purple-600 border-2 border-[#121623] text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>

        <h2 className="text-xl font-extrabold text-white tracking-tight mb-6">{username}</h2>

        {/* Stats Row: Played | Wins | Win Rate */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800/80">
          <div>
            <span className="text-xl font-black text-purple-400 block">{gamesPlayed}</span>
            <span className="text-xs text-slate-400 font-medium">Played</span>
          </div>

          <div className="border-x border-slate-800/80">
            <span className="text-xl font-black text-amber-400 block">{wins}</span>
            <span className="text-xs text-slate-400 font-medium">Wins</span>
          </div>

          <div>
            <span className="text-xl font-black text-blue-400 block">{winRate}%</span>
            <span className="text-xs text-slate-400 font-medium">Win Rate</span>
          </div>
        </div>
      </div>

      {/* Options List */}
      <div className="space-y-3 mb-6">
        
        {/* Edit Profile */}
        <button
          onClick={onOpenEditProfile}
          className="w-full bg-[#121623] border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 flex items-center justify-between transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Pencil className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-white">Edit Profile</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Refer & Earn */}
        <button
          onClick={onOpenReferrals}
          className="w-full bg-[#121623] border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 flex items-center justify-between transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Refer & Earn</span>
              <span className="text-[10px] text-purple-400 font-semibold">Earn 50 Bonus per friend</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* How to Play */}
        <button
          className="w-full bg-[#121623] border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 flex items-center justify-between transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-white">How to Play</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Support */}
        <button
          onClick={onOpenSupport}
          className="w-full bg-[#121623] border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 flex items-center justify-between transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-white">Support</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full bg-rose-950/20 border border-rose-900/40 hover:bg-rose-950/40 rounded-2xl p-4 flex items-center gap-3 text-rose-400 font-extrabold text-sm transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-900/30 flex items-center justify-center">
            <LogOut className="w-5 h-5" />
          </div>
          <span>Logout</span>
        </button>

      </div>

      {/* Footer Version */}
      <div className="text-center pt-2">
        <span className="text-xs text-slate-500 font-semibold">Royal Ludo v2.4.0</span>
      </div>

    </div>
  );
}
