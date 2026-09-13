import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { getAuthUser } from '@/lib/authHelper';

export async function GET(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      }, { status: 401 });
    }

    const referredUsers = await User.find({ referredBy: user.referralCode })
      .select('username avatarId avatarUrl createdAt stats')
      .sort({ createdAt: -1 })
      .lean();

    const totalEarnedRs = (referredUsers.length * 50);

    const invitedList = referredUsers.map(r => ({
      id: r._id,
      username: r.username,
      avatar_id: r.avatarId || 'av1',
      avatar_url: r.avatarUrl,
      joined_at: r.createdAt,
      total_played: r.stats?.played || 0
    }));

    return NextResponse.json({
      success: true,
      status: true,
      data: {
        referral_code: user.referralCode,
        total_referrals: referredUsers.length,
        total_earnings: totalEarnedRs,
        referral_bonus_per_user: 50,
        invited_users: invitedList
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
