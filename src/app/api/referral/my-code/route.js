import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';

export async function GET(req) {
  try {
    await connectDB();
    const user = await User.findOne({ role: 'USER' });

    return NextResponse.json({
      status: true,
      message: 'Referral code details',
      data: {
        referralCode: user?.referralCode || 'ROYAL50',
        shareUrl: `https://royalludo.com/ref/${user?.referralCode || 'ROYAL50'}`,
        bonusPerReferralRs: 50,
        totalReferred: 5,
        totalBonusEarnedRs: 250
      }
    });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
