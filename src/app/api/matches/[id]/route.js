import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Match } from '@/lib/models/Match';
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
      query = { $or: [{ _id: id }, { roomId: id }] };
    } else {
      query = { roomId: id };
    }

    const match = await Match.findOne(query).lean();
    if (!match) {
      return NextResponse.json({
        success: false,
        error: { code: 'MATCH_NOT_FOUND', message: 'Match not found' }
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      status: true,
      data: {
        match_id: match._id.toString(),
        room_id: match.roomId?.toString(),
        game_mode: match.gameMode,
        entry_fee: match.entryFee,
        prize_pool: match.prizePool,
        players: match.players || [],
        winner_id: match.winnerId ? match.winnerId.toString() : null,
        winner_username: match.winnerUsername || null,
        status: match.status,
        started_at: match.startedAt,
        completed_at: match.completedAt
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
