import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Room } from '@/lib/models/Room';
import { refundWallet } from '@/lib/walletHelper';
import { getAuthUser } from '@/lib/authHelper';
import mongoose from 'mongoose';

export async function POST(req, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({
        success: false,
        status: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = resolvedParams?.id;

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { roomCode: id }] };
    } else {
      query = { roomCode: id };
    }

    const room = await Room.findOne(query);

    if (!room) {
      return NextResponse.json({
        success: false,
        status: false,
        error: { code: 'ROOM_NOT_FOUND', message: 'Room not found' }
      }, { status: 404 });
    }

    if (room.creatorId.toString() !== user._id.toString()) {
      return NextResponse.json({
        success: false,
        status: false,
        error: { code: 'FORBIDDEN', message: 'Only the room host can cancel this room.' }
      }, { status: 403 });
    }

    if (room.status !== 'WAITING') {
      return NextResponse.json({
        success: false,
        status: false,
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
      status: true,
      message: `Room cancelled. Entry fee of ₹${room.entryFee} refunded to your wallet.`,
      data: {
        room_id: room._id.toString(),
        room_code: room.roomCode,
        refunded_amount: room.entryFee,
        new_balance: refundResult.wallet ? (refundResult.wallet.depositBalance + refundResult.wallet.winningBalance + refundResult.wallet.bonusBalance) : null,
        status: 'CANCELLED'
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
