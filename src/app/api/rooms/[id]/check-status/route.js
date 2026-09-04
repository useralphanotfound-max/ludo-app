import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Room } from '@/lib/models/Room';
import { refundWallet } from '@/lib/walletHelper';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const room = await Room.findById(id).populate('opponentId', 'username avatarUrl');
    if (!room) {
      return NextResponse.json({
        success: false,
        error: { code: 'ROOM_NOT_FOUND', message: 'Room not found' }
      }, { status: 404 });
    }

    const now = new Date();

    // Check if 45-second timer has expired while waiting
    if (room.status === 'WAITING' && now >= new Date(room.expiresAt)) {
      room.status = 'EXPIRED';
      room.refundedAt = now;
      await room.save();

      // Automatically refund Creator's wallet!
      await refundWallet({
        userId: room.creatorId,
        amount: room.entryFee,
        referenceId: room.roomCode,
        description: `Auto-refund for expired Room #${room.roomCode} (No player joined in 45s)`
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        room_id: room._id.toString(),
        room_code: room.roomCode,
        status: room.status,
        entry_fee: room.entryFee,
        prize_pool: room.prizePool,
        expires_at: room.expiresAt,
        is_expired: room.status === 'EXPIRED',
        opponent: room.opponentId ? {
          id: room.opponentId._id.toString(),
          username: room.opponentId.username,
          avatar_url: room.opponentId.avatarUrl
        } : null
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
