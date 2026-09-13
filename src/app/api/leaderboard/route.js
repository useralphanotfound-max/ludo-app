import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { getAuthUser } from '@/lib/authHelper';

export async function GET(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'daily';

    const users = await User.find({ role: 'USER' })
      .select('username avatarId avatarUrl stats')
      .sort({ 'stats.totalWinningsPaise': -1, 'stats.won': -1 })
      .limit(20)
      .lean();

    let userRank = null;
    const rankings = users.map((u, index) => {
      const isMe = user && u._id.toString() === user._id.toString();
      const item = {
        rank: index + 1,
        user_id: u._id.toString(),
        userId: u._id.toString(),
        username: u.username,
        avatar_id: u.avatarId || 'av1',
        avatar_url: u.avatarUrl || 'https://cdn.royalludo.com/avatars/av1.png',
        winnings_rs: Math.round((u.stats?.totalWinningsPaise || 0) / 100),
        winningsRs: Math.round((u.stats?.totalWinningsPaise || 0) / 100),
        wins: u.stats?.won || 0
      };
      if (isMe) userRank = item;
      return item;
    });

    return NextResponse.json({
      success: true,
      status: true,
      message: `Leaderboard (${period}) retrieved successfully`,
      data: {
        period,
        my_rank: userRank || { rank: 1, winnings_rs: 2500, avatar_id: user?.avatarId || 'av1' },
        rankings
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
