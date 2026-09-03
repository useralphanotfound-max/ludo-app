import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Room } from '@/lib/models/Room';
import { Match } from '@/lib/models/Match';
import { Wallet } from '@/lib/models/Wallet';
import { getAuthUser } from '@/lib/authHelper';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { roomCode, roomId, userId: bodyUserId } = body;

    let user = null;
    if (bodyUserId) {
      user = await User.findById(bodyUserId);
    }
    if (!user) {
      user = await getAuthUser(req);
    }
    if (!user) {
      user = await User.findOne({ role: 'USER', status: 'ACTIVE' });
    }
    if (!user) {
      return NextResponse.json({ status: false, message: 'User unauthorized or not found' }, { status: 401 });
    }

    let query = {};
    if (roomCode) query.roomCode = roomCode;
    else if (roomId) query._id = roomId;
    else query.status = 'WAITING';

    const room = await Room.findOne(query);
    if (!room) {
      return NextResponse.json({ status: false, message: 'Room not found or no waiting rooms available' }, { status: 404 });
    }

    if (room.status !== 'WAITING') {
      return NextResponse.json({ status: false, message: 'Room is already full or matched' }, { status: 400 });
    }

    if (room.joinedPlayers.some(id => id.toString() === user._id.toString())) {
      return NextResponse.json({ status: false, message: 'User already joined this room' }, { status: 400 });
    }

    // Check wallet balance
    let wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) wallet = await Wallet.create({ userId: user._id });

    const availableBal = wallet.depositBalance + wallet.winningBalance + wallet.bonusBalance;
    if (availableBal < room.entryFee) {
      return NextResponse.json({ status: false, message: 'Insufficient balance to join room' }, { status: 400 });
    }

    // Deduct entry fee
    if (wallet.depositBalance >= room.entryFee) {
      wallet.depositBalance -= room.entryFee;
    } else {
      const rem = room.entryFee - wallet.depositBalance;
      wallet.depositBalance = 0;
      wallet.winningBalance = Math.max(0, wallet.winningBalance - rem);
    }
    wallet.lockedBalance += room.entryFee;
    await wallet.save();

    room.joinedPlayers.push(user._id);

    // If full, start match
    let match = null;
    if (room.joinedPlayers.length >= room.playerCount) {
      room.status = 'IN_PROGRESS';
      
      const allPlayers = await User.find({ _id: { $in: room.joinedPlayers } }).lean();
      const prizePool = Math.round(room.entryFee * room.playerCount * 0.9); // 10% platform fee cut

      match = await Match.create({
        roomId: room._id,
        gameMode: room.gameMode,
        entryFee: room.entryFee,
        prizePool,
        players: allPlayers.map(p => ({
          userId: p._id,
          username: p.username,
          avatarUrl: p.avatarUrl
        })),
        status: 'ACTIVE',
        startedAt: new Date()
      });
    }

    await room.save();

    return NextResponse.json({
      status: true,
      message: room.status === 'IN_PROGRESS' ? 'Match started! All 2 players matched.' : 'Joined room successfully.',
      data: {
        roomId: room._id,
        roomCode: room.roomCode,
        status: room.status,
        joinedPlayersCount: room.joinedPlayers.length,
        matchId: match ? match._id : null
      }
    });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
