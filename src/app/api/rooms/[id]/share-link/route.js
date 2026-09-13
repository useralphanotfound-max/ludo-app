import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Room } from '@/lib/models/Room';
import { getAuthUser } from '@/lib/authHelper';
import mongoose from 'mongoose';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      }, { status: 401 });
    }

    const { id } = await params;

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

    const roomCode = room.ludoKingCode || room.roomCode;
    const shareLink = `https://royalludo.com/join/${room.roomCode}`;
    const shareMessage = `Join my Royal Ludo room! Code: ${roomCode} — ${shareLink}`;

    return NextResponse.json({
      success: true,
      data: {
        room_code: room.roomCode,
        ludo_king_code: roomCode,
        is_code_shared: room.isCodeShared || !!room.ludoKingCode,
        share_link: shareLink,
        share_message: shareMessage
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { ludo_king_code, ludoKingCode, room_code, roomCode } = body;

    const targetCode = ludo_king_code || ludoKingCode || room_code || roomCode;

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
        error: { code: 'FORBIDDEN', message: 'Only the room creator can share the room code' }
      }, { status: 403 });
    }

    if (targetCode) {
      room.ludoKingCode = targetCode.toString().trim();
    }
    room.isCodeShared = true;
    if (['WAITING', 'JOINED', 'MATCHED'].includes(room.status)) {
      room.status = 'PLAYING';
    }
    await room.save();

    const finalCode = room.ludoKingCode || room.roomCode;
    const shareLink = `https://royalludo.com/join/${room.roomCode}`;
    const shareMessage = `Join my Royal Ludo room! Code: ${finalCode} — ${shareLink}`;

    return NextResponse.json({
      success: true,
      status: true,
      message: 'Room code shared successfully with opponent.',
      data: {
        room_id: room._id.toString(),
        room_code: room.roomCode,
        ludo_king_code: finalCode,
        is_code_shared: true,
        share_link: shareLink,
        share_message: shareMessage,
        status: room.status
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
