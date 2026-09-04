import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Room } from '@/lib/models/Room';
import { refundWallet } from '@/lib/walletHelper';

export async function GET(req) {
  try {
    await connectDB();

    const now = new Date();

    // Auto-expire outdated waiting rooms
    const expiredRooms = await Room.find({
      status: 'WAITING',
      expiresAt: { $lte: now },
      refundedAt: null
    });

    for (const room of expiredRooms) {
      room.status = 'EXPIRED';
      room.refundedAt = now;
      await room.save();
      await refundWallet({
        userId: room.creatorId,
        amount: room.entryFee,
        referenceId: room.roomCode,
        description: `Auto-refund for expired Room #${room.roomCode} (No player joined in 45s)`
      });
    }

    // Fetch active non-expired public waiting rooms
    const rooms = await Room.find({
      status: 'WAITING',
      isPrivate: false,
      expiresAt: { $gt: now }
    })
      .populate('creatorId', 'username avatarUrl mobile')
      .sort({ createdAt: -1 })
      .lean();

    const formattedRooms = rooms.map(r => ({
      room_id: r._id.toString(),
      room_code: r.roomCode,
      game_mode: r.gameMode,
      player_count: r.playerCount,
      entry_fee: r.entryFee,
      prize_pool: r.prizePool,
      status: r.status,
      expires_at: r.expiresAt,
      creator: {
        id: r.creatorId?._id?.toString(),
        username: r.creatorId?.username || 'Player',
        avatar_url: r.creatorId?.avatarUrl || ''
      }
    }));

    return NextResponse.json({
      success: true,
      data: {
        rooms: formattedRooms,
        count: formattedRooms.length
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
