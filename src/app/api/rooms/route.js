import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Room } from '@/lib/models/Room';
import { User } from '@/lib/models/User';
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
      try {
        await Room.updateOne(
          { _id: room._id },
          { $set: { status: 'EXPIRED', refundedAt: now } }
        );
        if (room.entryFee > 0 && room.creatorId) {
          await refundWallet({
            userId: room.creatorId,
            amount: room.entryFee,
            referenceId: room.roomCode,
            description: `Auto-refund for expired Room #${room.roomCode}`
          });
        }
      } catch (refundErr) {
        console.error('Expired room refund error:', room.roomCode, refundErr);
      }
    }

    const { searchParams } = new URL(req.url);
    const feeFilter = searchParams.get('entry_fee') || searchParams.get('entryFee');

    const query = {
      status: 'WAITING',
      isPrivate: false,
      expiresAt: { $gt: now }
    };

    if (feeFilter) query.entryFee = Number(feeFilter);

    const rooms = await Room.find(query)
      .populate('creatorId', 'username avatarId avatarUrl mobile')
      .sort({ createdAt: -1 })
      .lean();

    const formattedRooms = rooms.map(r => ({
      room_id: r._id.toString(),
      room_code: r.roomCode,
      game_mode: r.gameMode || 'CLASSIC',
      player_count: r.playerCount || 2,
      entry_fee: r.entryFee,
      prize_pool: r.prizePool,
      status: r.status,
      creator: {
        id: r.creatorId?._id?.toString() || r.creatorId?.toString() || '',
        username: r.creatorId?.username || 'Player',
        avatar_id: r.creatorId?.avatarId || 'av1',
        avatar_url: r.creatorId?.avatarUrl || 'assets/images/avatars/avatar1.png'
      },
      created_at: r.createdAt ? r.createdAt.toISOString() : now.toISOString(),
      expires_at: r.expiresAt ? r.expiresAt.toISOString() : now.toISOString()
    }));

    return NextResponse.json({
      success: true,
      status: true,
      message: 'Available challenge rooms retrieved',
      data: formattedRooms
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      status: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
