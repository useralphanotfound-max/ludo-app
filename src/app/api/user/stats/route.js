import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';

export async function GET(req) {
  try {
    await connectDB();
    const user = await User.findOne({ role: 'USER' });

    if (!user) return NextResponse.json({ status: false, message: 'User not found' }, { status: 404 });

    const winRate = user.stats.played > 0 ? Math.round((user.stats.won / user.stats.played) * 100) : 0;

    return NextResponse.json({
      status: true,
      message: 'User statistics retrieved',
      data: {
        played: user.stats.played,
        won: user.stats.won,
        lost: user.stats.lost,
        winRatePct: winRate,
        level: user.level,
        xp: user.xp,
        totalWinningsRs: Math.round(user.stats.totalWinningsPaise / 100)
      }
    });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
