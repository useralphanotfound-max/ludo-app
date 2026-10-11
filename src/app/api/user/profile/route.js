import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Match } from '@/lib/models/Match';
import { getAuthUser } from '@/lib/authHelper';
import { getOrCreateWallet } from '@/lib/walletHelper';

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

    const wallet = await getOrCreateWallet(user._id);
    const totalBalance = wallet.depositBalance + wallet.winningBalance + wallet.bonusBalance;

    // Compute dynamic user match stats
    const [realMatchesCount, realWinsCount] = await Promise.all([
      Match.countDocuments({ 'players.userId': user._id }).catch(() => 0),
      Match.countDocuments({ winnerId: user._id }).catch(() => 0)
    ]);

    const totalMatches = realMatchesCount || user.stats?.played || 0;
    const totalWins = realWinsCount || user.stats?.won || 0;

    return NextResponse.json({
      success: true,
      message: 'Profile fetched successfully',
      data: {
        user: {
          id: user._id.toString(),
          alias: user.username || `Player_${user.mobile.slice(-4)}`,
          username: user.username,
          mobile: user.mobile,
          avatar_id: user.avatarId || 'av1',
          avatar_url: user.avatarUrl || 'assets/images/avatars/avatar1.png',
          total_balance: totalBalance,
          wallet_balance: totalBalance,
          deposit_balance: wallet.depositBalance,
          winning_balance: wallet.winningBalance,
          bonus_balance: wallet.bonusBalance,
          total_wins: totalWins,
          total_matches: totalMatches,
          referral_code: user.referralCode,
          kyc_status: 'NONE'
        }
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
