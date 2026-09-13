import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { getAuthUser } from '@/lib/authHelper';

export async function GET(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);

    if (!user) {
      return NextResponse.json({ success: false, status: false, message: 'Unauthorized access. Please login.' }, { status: 401 });
    }

    const played = user.stats?.played || 0;
    const won = user.stats?.won || 0;
    const lost = user.stats?.lost || 0;
    const winRate = played > 0 ? Number(((won / played) * 100).toFixed(2)) : 0;
    const totalWinningsRs = Math.round((user.stats?.totalWinningsPaise || 0) / 100);

    return NextResponse.json({
      success: true,
      status: true,
      message: 'User statistics retrieved successfully',
      data: {
        played,
        games_played: played,
        total_played: played,
        total_matches_played: played,
        totalMatches: played,
        won,
        total_wins: won,
        wins: won,
        lost,
        total_losses: lost,
        losses: lost,
        winRatePct: Math.round(winRate),
        win_rate_pct: Math.round(winRate),
        win_percentage: winRate,
        level: user.level || 1,
        xp: user.xp || 0,
        totalWinningsRs,
        total_winnings_rs: totalWinningsRs
      }
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, status: false, message: error.message }, { status: 500 });
  }
}
