'use client';
import React, { useState } from 'react';
import { ArrowLeft, User, Users, Plus, Info, AlertCircle } from 'lucide-react';

export default function CreateRoomScreen({
  userBalance = 2500,
  onBack,
  onCreateRoom,
  isSubmitting,
  errorMessage
}) {
  const [entryFee, setEntryFee] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [feeError, setFeeError] = useState('');

  const winningPool = entryFee && !isNaN(entryFee) ? (Number(entryFee) * 1.8).toFixed(0) : '0';

  const handleSubmit = (e) => {
    e.preventDefault();
    setFeeError('');

    const fee = Number(entryFee);
    if (!fee || fee <= 0) {
      setFeeError('Please enter a valid entry fee');
      return;
    }
    if (fee > userBalance) {
      setFeeError(`Insufficient balance. Available: ₹${userBalance}`);
      return;
    }

    onCreateRoom({
      entry_fee: fee,
      room_code: roomCode.trim() || undefined,
      game_mode: 'CLASSIC',
      player_count: 2
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#070913] text-white p-4 relative overflow-y-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white font-bold text-lg hover:text-yellow-400 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
          <span>Create</span>
        </button>

        <div className="flex items-center gap-1.5 py-1.5 px-4 bg-[#121623] border border-slate-800 rounded-full">
          <div className="w-5 h-5 rounded-md bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center">🎲</div>
          <span className="text-sm font-black text-white">{Number(userBalance).toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-6 max-w-sm mx-auto w-full">
        
        {/* Game Mode */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-2">Game Mode</label>
          <div className="p-4 bg-purple-950/40 border-2 border-purple-500/80 rounded-2xl flex items-center justify-center gap-2 text-purple-300 font-bold text-base shadow-lg shadow-purple-900/20">
            <div className="grid grid-cols-2 gap-1 w-5 h-5">
              <div className="bg-purple-400 rounded-xs" />
              <div className="bg-purple-400 rounded-xs" />
              <div className="bg-purple-400 rounded-xs" />
              <div className="bg-purple-400 rounded-xs" />
            </div>
            <span>Classic</span>
          </div>
        </div>

        {/* Player Count */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-2">Player Count</label>
          <div className="grid grid-cols-2 gap-3">
            {/* 2 Players (Active) */}
            <div className="p-4 bg-purple-950/50 border-2 border-purple-500 rounded-2xl flex items-center gap-3 cursor-pointer shadow-lg shadow-purple-900/20">
              <div className="w-10 h-10 rounded-full bg-purple-800/60 flex items-center justify-center text-purple-300">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-white block leading-tight">2 Players</span>
                <span className="text-[10px] text-slate-400 font-medium">1 vs 1 Battle</span>
              </div>
            </div>

            {/* 4 Players (Disabled) */}
            <div className="p-4 bg-[#121623]/60 border border-slate-800 rounded-2xl flex items-center gap-3 opacity-40 cursor-not-allowed">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-slate-300 block leading-tight">4 Players</span>
                <span className="text-[10px] text-slate-500 font-medium">1 vs 4 Battle</span>
              </div>
            </div>
          </div>
        </div>

        {/* Entry Fee */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-300">Entry Fee</label>
            <span className="text-[11px] font-semibold text-purple-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              Winning pool: 1.8x ({winningPool} RS)
            </span>
          </div>

          <div className="bg-[#121623] border border-slate-700/80 rounded-2xl p-4 space-y-1 focus-within:border-yellow-400 focus-within:ring-2 focus-within:ring-yellow-400/20 transition-all">
            <span className="text-[11px] text-slate-400 font-medium block">Enter Amount (Rupees)</span>
            <input
              type="number"
              value={entryFee}
              onChange={(e) => setEntryFee(e.target.value)}
              placeholder="e.g. 100"
              className="w-full bg-transparent text-white font-black text-xl focus:outline-none placeholder:text-slate-600 placeholder:font-normal"
              disabled={isSubmitting}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Enter the entry fee amount that players must pay to join this room.
          </p>
        </div>

        {/* Private Room (OPTIONAL) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-300">Private Room</label>
            <span className="text-[10px] font-extrabold text-purple-400 tracking-wider">OPTIONAL</span>
          </div>

          <div className="bg-[#121623] border border-slate-700/80 rounded-2xl p-4 space-y-1 focus-within:border-yellow-400 transition-all">
            <span className="text-[11px] text-slate-400 font-medium block">Enter Room Code</span>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="e.g. 123456"
              className="w-full bg-transparent text-white font-extrabold text-base focus:outline-none placeholder:text-slate-600 placeholder:font-normal"
              disabled={isSubmitting}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Enter a code to join a private room or leave blank for public room.
          </p>
        </div>

        {/* Errors */}
        {(feeError || errorMessage) && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{feeError || errorMessage}</span>
          </div>
        )}

        {/* Room Entry Summary & Create Button */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-slate-300">Room Entry</span>
            <span className="text-base font-extrabold text-yellow-400">
              — {entryFee ? `${entryFee} RS` : 'RS'}
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !entryFee}
            className="w-full py-4 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-yellow-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 border border-yellow-300/40 disabled:opacity-50 cursor-pointer"
          >
            <span>{isSubmitting ? 'Creating Room...' : 'Create Room'}</span>
            <Plus className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

      </form>
    </div>
  );
}
