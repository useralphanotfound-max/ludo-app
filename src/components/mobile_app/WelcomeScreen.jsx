'use client';
import React from 'react';
import { ChevronRight, ShieldCheck } from 'lucide-react';

export default function WelcomeScreen({ onGetStarted }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#070913] text-white justify-between items-center p-6 relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Spacer */}
      <div className="w-full pt-10" />

      {/* Main Content */}
      <div className="flex flex-col items-center text-center my-auto z-10">
        {/* 3D Royal Ludo Logo Graphic */}
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-yellow-500/30 rounded-3xl blur-2xl group-hover:bg-yellow-500/50 transition-all duration-500" />
          <div className="w-36 h-36 md:w-44 md:h-44 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 rounded-3xl p-3 shadow-2xl shadow-yellow-500/30 flex items-center justify-center border-4 border-yellow-300/40 relative">
            <div className="w-full h-full bg-[#111624] rounded-2xl flex flex-col items-center justify-center p-2 relative overflow-hidden border border-yellow-400/30">
              <div className="grid grid-cols-2 gap-2 w-16 h-16 mb-1">
                <div className="w-7 h-7 bg-red-500 rounded-lg shadow-md flex items-center justify-center text-white text-xs font-black">●</div>
                <div className="w-7 h-7 bg-green-500 rounded-lg shadow-md flex items-center justify-center text-white text-xs font-black">●</div>
                <div className="w-7 h-7 bg-blue-500 rounded-lg shadow-md flex items-center justify-center text-white text-xs font-black">●</div>
                <div className="w-7 h-7 bg-yellow-400 rounded-lg shadow-md flex items-center justify-center text-white text-xs font-black">●</div>
              </div>
              <span className="text-yellow-400 font-black text-xs tracking-wider uppercase leading-tight drop-shadow">ROYAL</span>
              <span className="text-white font-black text-sm tracking-wider uppercase leading-tight">LUDO</span>
            </div>
          </div>
        </div>

        {/* App Name & Tagline */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-purple-500 mb-2 tracking-tight drop-shadow-md">
          Royal Ludo
        </h1>
        <p className="text-xs md:text-sm font-semibold tracking-widest text-slate-300 uppercase mb-8">
          BOOK. MATCH. PLAY.
        </p>
      </div>

      {/* Bottom CTA Button & Footer */}
      <div className="w-full max-w-sm flex flex-col items-center gap-4 z-10 pb-6">
        <button
          onClick={onGetStarted}
          className="w-full py-4 px-6 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-bold text-base md:text-lg rounded-2xl shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer border border-yellow-300/50"
        >
          <span>Get Started</span>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium pt-2">
          <span>v1.0.4</span>
          <span>•</span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
          <span>Certified Fair Play</span>
        </div>
      </div>
    </div>
  );
}
