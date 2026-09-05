'use client';
import React, { useState } from 'react';
import { X, Check, Moon, Sun, Pencil, UserCheck, AlertCircle } from 'lucide-react';

const AVATAR_OPTIONS = [
  {
    id: 'av1',
    name: 'Knight',
    url: 'https://cdn.royalludo.com/avatars/av1.png',
    fallbackBg: 'bg-amber-500'
  },
  {
    id: 'av2',
    name: 'Queen',
    url: 'https://cdn.royalludo.com/avatars/av2.png',
    fallbackBg: 'bg-rose-500'
  },
  {
    id: 'av3',
    name: 'King',
    url: 'https://cdn.royalludo.com/avatars/av3.png',
    fallbackBg: 'bg-emerald-500'
  }
];

export default function ProfileSetupModal({
  initialUsername = 'KingPlayer_01',
  initialAvatarId = 'av1',
  onSaveProfile,
  onClose,
  isSubmitting,
  errorMessage
}) {
  const [username, setUsername] = useState(initialUsername);
  const [selectedAvatarId, setSelectedAvatarId] = useState(initialAvatarId);
  const [theme, setTheme] = useState('dark');
  const [nameError, setNameError] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setNameError('');
    if (!username.trim() || username.trim().length < 3) {
      setNameError('Username must be at least 3 characters');
      return;
    }
    onSaveProfile({
      username: username.trim(),
      avatar_id: selectedAvatarId,
      theme
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#121623] border border-slate-700/80 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative text-white">
        
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Header Badge */}
        <div className="w-12 h-12 bg-purple-900/40 border border-purple-500/30 rounded-2xl flex items-center justify-center text-purple-400 mb-4 shadow-lg shadow-purple-500/10">
          <UserCheck className="w-6 h-6" />
        </div>

        {/* Header Text */}
        <h3 className="text-xl font-bold text-white mb-1">Select Your Profile</h3>
        <p className="text-xs text-slate-400 mb-6">
          Choose an avatar, name, and theme preference
        </p>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* SELECT THEME */}
          <div>
            <label className="block text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-2.5">
              SELECT THEME
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#0a0d17] p-1.5 border border-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  theme === 'dark'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark Mode</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  theme === 'light'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light Mode</span>
              </button>
            </div>
          </div>

          {/* CHOOSE AVATAR */}
          <div>
            <label className="block text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-3">
              CHOOSE AVATAR
            </label>
            <div className="grid grid-cols-3 gap-3">
              {AVATAR_OPTIONS.map((av) => {
                const isSelected = selectedAvatarId === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatarId(av.id)}
                    className={`relative rounded-full aspect-square p-1 transition-all flex items-center justify-center group ${
                      isSelected
                        ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-[#121623] scale-105 shadow-xl shadow-yellow-500/20'
                        : 'opacity-70 hover:opacity-100 hover:scale-100'
                    }`}
                  >
                    {/* Circle Graphic Avatar */}
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-yellow-300/40 bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center shadow-inner">
                      <div className="w-full h-full bg-[#1b2236] flex items-center justify-center text-lg font-black text-amber-300">
                        {av.id === 'av1' ? '🤴' : av.id === 'av2' ? '👸' : '🎮'}
                      </div>
                    </div>

                    {/* Selected Badge Checkmark */}
                    {isSelected && (
                      <div className="absolute top-0 right-0 bg-yellow-400 text-slate-950 rounded-full p-1 border-2 border-[#121623] shadow-md">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* EDIT NAME */}
          <div>
            <label className="block text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-2">
              EDIT NAME
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-purple-400">
                <Pencil className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Nickname"
                className="w-full pl-10 pr-4 py-3.5 bg-[#0a0d17] border border-slate-800 rounded-2xl text-white font-bold text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
                disabled={isSubmitting}
              />
            </div>
            {nameError && (
              <p className="text-xs text-rose-400 mt-1.5 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {nameError}
              </p>
            )}
            {errorMessage && (
              <p className="text-xs text-rose-400 mt-1.5 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errorMessage}
              </p>
            )}
          </div>

          {/* SAVE BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-extrabold text-base rounded-2xl shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer border border-yellow-300/40"
          >
            <span>{isSubmitting ? 'Saving Profile...' : 'Save Profile'}</span>
            <Check className="w-5 h-5 stroke-[3]" />
          </button>
        </form>

      </div>
    </div>
  );
}
