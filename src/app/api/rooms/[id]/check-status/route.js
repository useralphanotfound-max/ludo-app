import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Room } from '@/lib/models/Room';
import { refundWallet } from '@/lib/walletHelper';
import mongoose from 'mongoose';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const id = resolvedParams?.id;

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { roomCode: id }] };
    } else {
      query = { roomCode: id };
    }

    const room = await Room.findOne(query).populate('opponentId', 'username avatarUrl');
    if (!room) {
      return NextResponse.json({
        success: false,
        status: false,
        error: { code: 'ROOM_NOT_FOUND', message: 'Room not found' }
      }, { status: 404 });
    }

    const now = new Date();

    // Check if room timer has expired while waiting
    if (room.status === 'WAITING' && room.expiresAt && now >= new Date(room.expiresAt) && !room.refundedAt) {
      room.status = 'EXPIRED';
      room.refundedAt = now;
      await room.save();

      // Automatically refund Creator's wallet!
      await refundWallet({
        userId: room.creatorId,
        amount: room.entryFee,
        referenceId: room.roomCode,
        description: `Auto-refund for expired Room #${room.roomCode} (Timeout)`
      }).catch((e) => console.error('Check-status refund error:', e));
    }

    const secondsRemaining = room.expiresAt
      ? Math.max(0, Math.floor((new Date(room.expiresAt).getTime() - now.getTime()) / 1000))
      : 180;

    return NextResponse.json({
      success: true,
      status: true,
      data: {
        room_id: room._id.toString(),
        room_code: room.roomCode,
        status: room.status,
        entry_fee: room.entryFee,
        prize_pool: room.prizePool,
        expires_at: room.expiresAt ? room.expiresAt.toISOString() : null,
        seconds_remaining: secondsRemaining,
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
      status: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
