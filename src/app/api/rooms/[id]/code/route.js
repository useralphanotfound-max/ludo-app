import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Room } from '@/lib/models/Room';
import { getAuthUser } from '@/lib/authHelper';
import mongoose from 'mongoose';

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = resolvedParams?.id;

    const body = await req.json().catch(() => ({}));
    const targetCode = (body.ludo_king_code || body.ludoKingCode || body.code || '').toString().trim();

    if (!targetCode) {
      return NextResponse.json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Ludo King Room Code is required' }
      }, { status: 400 });
    }

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
        error: { code: 'ROOM_NOT_FOUND', message: 'Room not found' }
      }, { status: 404 });
    }

    if (room.creatorId.toString() !== user._id.toString()) {
      return NextResponse.json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only the room host can submit the Ludo King code' }
      }, { status: 403 });
    }

    room.ludoKingCode = targetCode;
    room.isCodeShared = true;
    room.status = 'CODE_SHARED';
    await room.save();

    return NextResponse.json({
      success: true,
      status: true,
      message: 'Ludo King room code set.',
      data: {
        room_id: room._id.toString(),
        room_code: room.roomCode,
        ludo_king_code: room.ludoKingCode,
        status: 'CODE_SHARED'
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}

export async function POST(req, ctx) {
  return PUT(req, ctx);
}
