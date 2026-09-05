'use client';
import React, { useState, useEffect } from 'react';
import { X, Trophy } from 'lucide-react';

export default function LeaderboardModal({ onClose }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard?type=weekly')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.leaderboard) {
          setLeaderboard(data.data.leaderboard);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const defaultLeaderboard = [
    { rank: 1, username: 'Peddi', total_winnings: 12450, avatar_url: 'av1' },
    { rank: 2, username: 'Pushpa', total_winnings: 10200, avatar_url: 'av2' },
    { rank: 3, username: 'Dacoit', total_winnings: 9850, avatar_url: 'av3' },
    { rank: 4, username: 'KingLudo_99', total_winnings: 8400, avatar_url: 'av4' },
    { rank: 5, username: 'ProPlayer', total_winnings: 7100, avatar_url: 'av5' }
  ];

  const list = leaderboard.length > 0 ? leaderboard : defaultLeaderboard;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#121623] border border-slate-700/80 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative text-white max-h-[85vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Podium Graphic */}
        <div className="flex flex-col items-center text-center mb-6 pt-2">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mb-3 text-amber-400 shadow-lg shadow-amber-500/10">
            <Trophy className="w-9 h-9" />
          </div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">Top Players Leaderboard</h3>
        </div>

        {/* Rank List */}
        <div className="space-y-3">
          {list.map((item) => (
            <div
              key={item.rank}
              className="bg-[#0d111d] border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between shadow-md"
            >
              <div className="flex items-center gap-3">
                {/* Avatar with rank number badge */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full border-2 border-yellow-400 bg-amber-500/20 flex items-center justify-center text-base font-bold">
                    {item.rank === 1 ? '🤴' : item.rank === 2 ? '👸' : item.rank === 3 ? '🥷' : '🎮'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center border border-[#0d111d]">
                    {item.rank}
                  </div>
                </div>

                <div>
                  <span className="text-sm font-extrabold text-white block leading-tight">
                    {item.username}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-amber-400">
                  {Number(item.total_winnings).toLocaleString('en-IN')} Rs
                </span>
                {item.rank === 1 && (
                  <Trophy className="w-4 h-4 text-amber-400 fill-amber-400" />
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
