import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Room } from '@/lib/models/Room';
import { refundWallet } from '@/lib/walletHelper';

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const room = await Room.findById(id);
    if (!room) {
      return NextResponse.json({
        success: false,
        error: { code: 'ROOM_NOT_FOUND', message: 'Room not found' }
      }, { status: 404 });
    }

    if (room.status === 'MATCHED' || room.status === 'COMPLETED') {
      return NextResponse.json({
        success: false,
        error: { code: 'ROOM_ALREADY_MATCHED', message: 'Room was already matched with an opponent.' }
      }, { status: 400 });
    }

    if (room.status === 'EXPIRED') {
      return NextResponse.json({
        success: true,
        message: 'Room was already expired and refunded.',
        data: { refunded_amount: room.entryFee, status: 'EXPIRED' }
      }, { status: 200 });
    }

    room.status = 'EXPIRED';
    room.refundedAt = new Date();
    await room.save();

    const refundResult = await refundWallet({
      userId: room.creatorId,
      amount: room.entryFee,
      referenceId: room.roomCode,
      description: `Auto-refund for expired Room #${room.roomCode} (45-second timer elapsed)`
    });

    return NextResponse.json({
      success: true,
      message: `45-second timer expired. Entry fee of ₹${room.entryFee} refunded to creator's wallet.`,
      data: {
        room_id: room._id.toString(),
        refunded_amount: room.entryFee,
        new_balance: refundResult.wallet.depositBalance + refundResult.wallet.winningBalance + refundResult.wallet.bonusBalance,
        status: 'EXPIRED'
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
