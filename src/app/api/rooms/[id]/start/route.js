import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Room } from '@/lib/models/Room';
import { Match } from '@/lib/models/Match';
import { getAuthUser } from '@/lib/authHelper';
import mongoose from 'mongoose';

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

    const isHost = room.creatorId.toString() === user._id.toString();
    const isPlayer = (room.joinedPlayers || []).some(p => p.toString() === user._id.toString());

    if (!isPlayer) {
      return NextResponse.json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You are not a player in this room' }
      }, { status: 403 });
    }

    if (isHost) room.hostStarted = true;
    else room.opponentStarted = true;

    room.status = 'IN_PROGRESS';
    await room.save();

    let match = await Match.findOne({ roomId: room._id });
    if (!match) {
      const commPct = 10;
      const grossPrize = room.entryFee * (room.playerCount || 2);
      const prizePool = grossPrize - ((grossPrize * commPct) / 100);
      match = await Match.create({
        roomId: room._id,
        gameMode: room.gameMode || 'CLASSIC',
        entryFee: room.entryFee,
        prizePool,
        status: 'ACTIVE',
        startedAt: new Date()
      });
    } else if (match.status !== 'ACTIVE') {
      match.status = 'ACTIVE';
      await match.save();
    }

    return NextResponse.json({
      success: true,
      status: true,
      message: 'Match started! Both players are live.',
      data: {
        room_id: room._id.toString(),
        room_code: room.roomCode,
        ludo_king_code: room.ludoKingCode,
        status: room.status,
        host_started: room.hostStarted,
        opponent_started: room.opponentStarted,
        match_id: match?._id?.toString()
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}

export async function PUT(req, ctx) {
  return POST(req, ctx);
}
