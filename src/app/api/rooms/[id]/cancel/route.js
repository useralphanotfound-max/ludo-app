import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Room } from '@/lib/models/Room';
import { refundWallet } from '@/lib/walletHelper';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'royal-ludo-super-secret-jwt-key-2026';

function getUserFromToken(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export async function POST(req, { params }) {
  try {
    await connectDB();
    const userPayload = getUserFromToken(req);
    if (!userPayload) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication token required' }
      }, { status: 401 });
    }

    const { id } = params;
    const room = await Room.findById(id);

    if (!room) {
      return NextResponse.json({
        success: false,
        error: { code: 'ROOM_NOT_FOUND', message: 'Room not found' }
      }, { status: 404 });
    }

    if (room.creatorId.toString() !== userPayload.userId) {
      return NextResponse.json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only the room host can cancel this room.' }
      }, { status: 403 });
    }

    if (room.status !== 'WAITING') {
      return NextResponse.json({
        success: false,
        error: { code: 'CANNOT_CANCEL', message: `Cannot cancel room with status ${room.status}` }
      }, { status: 400 });
    }

    room.status = 'CANCELLED';
    room.refundedAt = new Date();
    await room.save();

    const refundResult = await refundWallet({
      userId: room.creatorId,
      amount: room.entryFee,
      referenceId: room.roomCode,
      description: `Manual Host Refund for cancelled Room #${room.roomCode}`
    });

    return NextResponse.json({
      success: true,
      message: `Room cancelled. Entry fee of ₹${room.entryFee} refunded to your wallet.`,
      data: {
        room_id: room._id.toString(),
        refunded_amount: room.entryFee,
        new_balance: refundResult.wallet.depositBalance + refundResult.wallet.winningBalance + refundResult.wallet.bonusBalance,
        status: 'CANCELLED'
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
