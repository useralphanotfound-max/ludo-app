import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Room } from '@/lib/models/Room';
import { getAuthUser } from '@/lib/authHelper';

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

    const { id } = params;

    const room = await Room.findOne({
      $or: [{ _id: id }, { roomCode: id }]
    });

    if (!room) {
      return NextResponse.json({
        success: false,
        error: { code: 'ROOM_NOT_FOUND', message: 'Room not found' }
      }, { status: 404 });
    }

    const roomCode = room.roomCode;
    const shareLink = `https://royalludo.com/join/${roomCode}`;
    const shareMessage = `Join my Royal Ludo room! Code: ${roomCode} — ${shareLink}`;

    return NextResponse.json({
      success: true,
      data: {
        room_code: roomCode,
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
