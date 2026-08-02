import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Wallet } from '@/lib/models/Wallet';

import { getAuthUser } from '@/lib/authHelper';

export async function GET(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ status: false, message: 'Unauthorized access. Please login.' }, { status: 401 });

    const wallet = await Wallet.findOne({ userId: user._id });

    return NextResponse.json({
      status: true,
      message: 'User profile retrieved',
      data: {
        id: user._id,
        username: user.username,
        mobile: user.mobile,
        avatarUrl: user.avatarUrl,
        referralCode: user.referralCode,
        stats: user.stats,
        wallet: {
          depositBalanceRs: (wallet?.depositBalance || 0) / 100,
          winningBalanceRs: (wallet?.winningBalance || 0) / 100,
          bonusBalanceRs: (wallet?.bonusBalance || 0) / 100,
          totalBalanceRs: ((wallet?.depositBalance || 0) + (wallet?.winningBalance || 0) + (wallet?.bonusBalance || 0)) / 100
        }
      }
    });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
