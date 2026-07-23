import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Match } from '@/lib/models/Match';

export async function GET(req) {
  try {
    await connectDB();
    const matches = await Match.find().sort({ createdAt: -1 }).limit(20);

    const data = matches.map(m => ({
      id: m._id,
      gameMode: m.gameMode,
      entryFeeRs: m.entryFee / 100,
      prizePoolRs: m.prizePool / 100,
      status: m.status,
      winnerId: m.winnerId,
      players: m.players,
      startedAt: m.startedAt
    }));

    return NextResponse.json({ status: true, message: 'Match history retrieved', data });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
