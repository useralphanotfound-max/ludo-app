import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Room } from '@/lib/models/Room';
import { Match } from '@/lib/models/Match';
import { Wallet } from '@/lib/models/Wallet';
import { getAuthUser } from '@/lib/authHelper';
import { refundWallet } from '@/lib/walletHelper';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { room_code, roomCode, room_id, roomId, userId: bodyUserId } = body;

    let user = null;
    if (bodyUserId) {
      user = await User.findById(bodyUserId);
    }
    if (!user) {
      user = await getAuthUser(req);
    }
    if (!user) {
      return NextResponse.json({ success: false, status: false, error: { code: 'UNAUTHORIZED', message: 'User unauthorized' } }, { status: 401 });
    }

    // Auto-expire outdated waiting rooms
    const now = new Date();
    const expiredRooms = await Room.find({ status: 'WAITING', expiresAt: { $lte: now }, refundedAt: null });
    for (const r of expiredRooms) {
      await Room.updateOne({ _id: r._id }, { $set: { status: 'EXPIRED', refundedAt: now } });
      await refundWallet({
        userId: r.creatorId,
        amount: r.entryFee,
        referenceId: r.roomCode,
        description: `Auto-refund for expired Room #${r.roomCode}`
      });
    }

    // Check if player is already in an active room
    const playerActiveRoom = await Room.findOne({
      joinedPlayers: user._id,
      status: { $in: ['WAITING', 'IN_PROGRESS'] },
      expiresAt: { $gt: now }
    });

    if (playerActiveRoom) {
      return NextResponse.json({ status: false, message: 'You are already in an active room or match' }, { status: 400 });
    }

    const targetCode = room_code || roomCode;
    const targetId = room_id || roomId;

    let query = {};
    if (targetCode) query.roomCode = targetCode.toString().trim();
    else if (targetId) query._id = targetId;
    else query.status = 'WAITING';
    query.expiresAt = { $gt: now };

    const room = await Room.findOne(query);
    if (!room) {
      return NextResponse.json({ success: false, status: false, error: { code: 'ROOM_NOT_FOUND', message: 'Room not found or room expired' } }, { status: 404 });
    }

    if (room.status !== 'WAITING') {
      return NextResponse.json({ status: false, message: 'Room is already full or matched' }, { status: 400 });
    }

    if (room.creatorId?.toString() === user._id.toString() || room.joinedPlayers.some(id => id.toString() === user._id.toString())) {
      return NextResponse.json({ status: false, message: 'You cannot join your own created room' }, { status: 400 });
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
    if (!room.opponentId && room.creatorId.toString() !== user._id.toString()) {
      room.opponentId = user._id;
    }

    // If full, start match
    let match = null;
    if (room.joinedPlayers.length >= room.playerCount) {
      room.status = 'IN_PROGRESS';
      
      const allPlayers = await User.find({ _id: { $in: room.joinedPlayers } }).lean();
      const commPct = 10;
      const grossPrize = room.entryFee * room.playerCount;
      const prizePool = grossPrize - ((grossPrize * commPct) / 100);

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

      // Auto-cancel any other waiting rooms created by the host and refund them
      const otherWaitingRooms = await Room.find({
        creatorId: room.creatorId,
        _id: { $ne: room._id },
        status: 'WAITING',
        refundedAt: null
      });

      for (const otherRoom of otherWaitingRooms) {
        otherRoom.status = 'CANCELLED';
        otherRoom.refundedAt = new Date();
        await otherRoom.save();

        await refundWallet({
          userId: room.creatorId,
          amount: otherRoom.entryFee,
          referenceId: otherRoom.roomCode,
          description: `Auto-refund for cancelled Room #${otherRoom.roomCode} as another match started`
        });
      }
    } else {
      room.status = 'JOINED';
    }

    await room.save();

    return NextResponse.json({
      success: true,
      status: true,
      message: room.status === 'IN_PROGRESS' ? `Match started! All ${room.playerCount} players matched.` : 'Joined room successfully.',
      data: {
        room_id: room._id.toString(),
        roomId: room._id.toString(),
        room_code: room.roomCode,
        roomCode: room.roomCode,
        status: room.status,
        joined_players_count: room.joinedPlayers.length,
        match_id: match ? match._id.toString() : null,
        matchId: match ? match._id.toString() : null
      }
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
