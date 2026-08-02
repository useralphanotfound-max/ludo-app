import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'daily';

    const users = await User.find({ role: 'USER' }).select('username avatarUrl stats').sort({ 'stats.totalWinningsPaise': -1 }).limit(10).lean();

    const rankings = users.map((u, index) => ({
      rank: index + 1,
      userId: u._id,
      username: u.username,
      avatarUrl: u.avatarUrl,
      winningsRs: Math.round(u.stats.totalWinningsPaise / 100)
    }));

    return NextResponse.json({
      status: true,
      message: `Leaderboard (${period}) retrieved`,
      data: {
        period,
        myRank: { rank: 1, winningsRs: 2500 },
        rankings
      }
    });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
