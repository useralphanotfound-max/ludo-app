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
      .select('username avatarUrl createdAt')
      .sort({ createdAt: -1 });

    const totalReferrals = referredUsers.length;
    const bonusPerReferral = 50.0;
    const totalEarned = totalReferrals * bonusPerReferral;

    const formattedReferred = referredUsers.map(u => ({
      username: u.username,
      avatar_url: u.avatarUrl || 'https://cdn.royalludo.com/avatars/av2.png',
      joined_at: u.createdAt,
      bonus_status: 'CREDITED'
    }));

    return NextResponse.json({
      success: true,
      data: {
        referral_code: user.referralCode,
        share_link: `https://royalludo.com/refer/${user.referralCode}`,
        bonus_per_referral: bonusPerReferral,
        total_referrals: totalReferrals,
        total_earned: totalEarned,
        pending_bonus: 0.00,
        referred_users: formattedReferred
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
