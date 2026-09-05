'use client';
import React, { useState, useEffect } from 'react';
import { RefreshCw, SlidersHorizontal, Plus, Share2, Play, User, Check, Clock, AlertCircle } from 'lucide-react';

export default function RoomsTab({
  user,
  wallet,
  onOpenCreateRoom,
  onRefreshData
}) {
  const [myRoom, setMyRoom] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCodeShared, setIsCodeShared] = useState(false);
  const [countdown, setCountdown] = useState(45);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [joiningId, setJoiningId] = useState(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const authFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers
    };
    return fetch(url, { ...options, headers });
  };

  const fetchRoomsData = async () => {
    setLoading(true);
    try {
      // 1. Fetch My Created Room
      const myRes = await authFetch('/api/rooms/my-room');
      const myData = await myRes.json();
      if (myData.success && myData.data) {
        setMyRoom(myData.data);
      } else {
        setMyRoom(null);
      }

      // 2. Fetch Available Rooms (this also triggers auto-expiration & auto-refunds backend side!)
      const availRes = await authFetch('/api/rooms/available');
      const availData = await availRes.json();
      if (availData.success && availData.data?.rooms) {
        setAvailableRooms(availData.data.rooms);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomsData();
    const interval = setInterval(fetchRoomsData, 5000); // Poll every 5s for room updates
    return () => clearInterval(interval);
  }, []);

  // 45-Second Countdown Timer for waiting room
  useEffect(() => {
    let timer = null;
    if (myRoom && myRoom.status === 'WAITING') {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            fetchRoomsData(); // Trigger backend auto-refund check
            if (onRefreshData) onRefreshData();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCountdown(45);
    }
    return () => clearInterval(timer);
  }, [myRoom]);

  // Share Code Handler
  const handleShareCode = () => {
    setIsCodeShared(true);
    setActionSuccess(`Room Code #${myRoom?.room_code} shared successfully! Opponent can now see room code.`);
  };

  // Join Room Handler
  const handleJoinRoom = async (roomId) => {
    setJoiningId(roomId);
    setActionError('');
    setActionSuccess('');

    try {
      const res = await authFetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        body: JSON.stringify({})
      });
      const data = await res.json();

      if (data.success) {
        setActionSuccess('Successfully joined room! Entry fee debited.');
        fetchRoomsData();
        if (onRefreshData) onRefreshData();
      } else {
        setActionError(data.error?.message || 'Failed to join room');
      }
    } catch (e) {
      setActionError('Network error occurred');
    } finally {
      setJoiningId(null);
    }
  };

  const totalBalance = wallet?.total_balance ?? wallet?.balance ?? 1250;

  return (
    <div className="flex flex-col min-h-screen bg-[#070913] text-white p-4 pb-24 relative overflow-y-auto">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6 pt-2">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Rooms</h1>
        <div className="flex items-center gap-1.5 py-1.5 px-4 bg-[#121623] border border-slate-800 rounded-full">
          <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">₹</div>
          <span className="text-sm font-black text-white">{Number(totalBalance).toLocaleString('en-IN')} Rs</span>
        </div>
      </div>

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

      {/* Section 1: My Created Room */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-extrabold text-white tracking-tight">My Created Room</h2>
          <button className="text-xs font-bold text-purple-400 hover:text-purple-300">Room Settings</button>
        </div>

        {myRoom ? (
          <div className="bg-gradient-to-br from-purple-900/60 via-indigo-950/70 to-[#121623] border border-purple-500/40 rounded-3xl p-5 shadow-xl shadow-purple-950/30 relative">
            
            {/* Header info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-purple-600/40 border border-purple-500/40 text-purple-300 text-[10px] font-extrabold rounded-lg uppercase tracking-wider">
                  {myRoom.game_mode}
                </span>
                <span className="text-xs font-bold text-slate-300">
                  Room #{isCodeShared ? myRoom.room_code : '••••'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400 bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800/40">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span>{myRoom.status === 'WAITING' ? `Waiting for players (${countdown}s)` : myRoom.status}</span>
              </div>
            </div>

            {/* Entry Coins & Players Joined */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="text-3xl font-extrabold text-yellow-400 block leading-tight">
                  {myRoom.entry_fee}
                </span>
                <span className="text-xs font-semibold text-slate-300">Coins Entry</span>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-200 block mb-1">
                  {myRoom.players_joined}/2 Players Joined
                </span>
                {/* 2 Avatar Slots */}
                <div className="flex items-center justify-end gap-1.5">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 border-2 border-yellow-400 flex items-center justify-center text-xs text-amber-300 font-bold">
                    🤴
                  </div>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs ${
                    myRoom.players_joined >= 2
                      ? 'bg-rose-500/20 border-rose-400 text-rose-300 font-bold'
                      : 'bg-slate-800/60 border-slate-700 text-slate-500'
                  }`}>
                    {myRoom.players_joined >= 2 ? '🎮' : '+'}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions: Share Code & Start Game */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleShareCode}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-bold text-sm rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 border border-yellow-300/40"
              >
                <Share2 className="w-4 h-4" />
                <span>{isCodeShared ? `Shared #${myRoom.room_code}` : 'Share Code'}</span>
              </button>

              {myRoom.players_joined >= 2 && (
                <button
                  onClick={() => setActionSuccess('Both players ready! Launching Classic Ludo Board...')}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 font-black text-sm rounded-2xl shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Game</span>
                </button>
              )}
            </div>

            {/* Countdown auto-refund notice */}
            {myRoom.status === 'WAITING' && (
              <p className="text-[10px] text-slate-400 text-center mt-3 font-medium">
                ⏱ Auto-closes & refunds to wallet in <span className="text-yellow-400 font-bold">{countdown}s</span> if no opponent joins.
              </p>
            )}

          </div>
        ) : (
          <div className="bg-[#121623] border border-slate-800/80 rounded-3xl p-6 text-center space-y-2">
            <p className="text-xs text-slate-400">You don't have an active room right now.</p>
            <button
              onClick={onOpenCreateRoom}
              className="py-2.5 px-6 bg-purple-600 text-white font-bold text-xs rounded-xl shadow-lg hover:bg-purple-500 transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Classic Room</span>
            </button>
          </div>
        )}
      </div>

      {/* Section 2: Available Rooms */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-extrabold text-white tracking-tight">Available Rooms</h2>
          <div className="flex items-center gap-2 text-slate-400">
            <button className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button onClick={fetchRoomsData} className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* List of Available Rooms */}
        <div className="space-y-3">
          {availableRooms.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs bg-[#121623]/40 border border-slate-800/50 rounded-2xl">
              No public rooms available right now. Click the + button below to create one!
            </div>
          ) : (
            availableRooms.map((room) => (
              <div
                key={room.room_id}
                className="bg-[#121623] border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-slate-700 transition-all shadow-md"
              >
                <div className="flex items-center gap-3">
                  {/* Creator Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-yellow-400 bg-amber-500/20 flex items-center justify-center text-lg font-bold">
                      👨‍💼
                    </div>
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#121623]" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-extrabold text-white">
                        {room.creator?.username || 'Player'}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">
                        #{room.room_code?.slice(-4)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-purple-900/60 text-purple-300 text-[10px] font-extrabold rounded-md uppercase">
                        {room.game_mode || 'CLASSIC'}
                      </span>
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center">₹</span>
                        {room.entry_fee}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-[10px] font-bold text-slate-400">
                    1/2 Full
                  </span>
                  <button
                    onClick={() => handleJoinRoom(room.room_id)}
                    disabled={joiningId === room.room_id}
                    className="py-2 px-6 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all border border-yellow-300/40 disabled:opacity-50"
                  >
                    {joiningId === room.room_id ? 'Joining...' : 'Join'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <button
        onClick={onOpenCreateRoom}
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 text-white rounded-full shadow-2xl shadow-purple-600/50 flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-2 border-purple-400/40 z-30 cursor-pointer"
        title="Create Room"
      >
        <Plus className="w-7 h-7 stroke-[3]" />
      </button>

    </div>
  );
}
