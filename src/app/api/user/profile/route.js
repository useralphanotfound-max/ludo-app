import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
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

    return NextResponse.json({
      success: true,
      message: 'Profile fetched successfully',
      data: {
        user: {
          id: user._id.toString(),
          alias: user.username || `Player_${user.mobile.slice(-4)}`,
          username: user.username,
          mobile: user.mobile,
          avatar_url: user.avatarUrl || 'assets/images/avatars/avatar1.png',
          wallet_balance: totalBalance,
          deposit_balance: wallet.depositBalance,
          winning_balance: wallet.winningBalance,
          bonus_balance: wallet.bonusBalance,
          referral_code: user.referralCode,
          kyc_status: user.kycStatus === 'VERIFIED' ? 'APPROVED' : (user.kycStatus || 'NOT_SUBMITTED')
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
