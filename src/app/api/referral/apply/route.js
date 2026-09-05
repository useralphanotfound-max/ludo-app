import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { getAuthUser } from '@/lib/authHelper';
import { creditWallet } from '@/lib/walletHelper';

export async function POST(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      }, { status: 401 });
    }

    if (user.referredBy) {
      return NextResponse.json({
        success: false,
        error: { code: 'REFERRAL_ALREADY_APPLIED', message: 'Referral code has already been applied to this account.' }
      }, { status: 400 });
    }

    const body = await req.json();
    const { referral_code, referralCode } = body;
    const code = (referral_code || referralCode || '').toString().trim().toUpperCase();

    if (!code) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_REFERRAL_CODE', message: 'Please provide a valid referral code.' }
      }, { status: 400 });
    }

    if (code === user.referralCode) {
      return NextResponse.json({
        success: false,
        error: { code: 'SELF_REFERRAL_NOT_ALLOWED', message: 'You cannot use your own referral code.' }
      }, { status: 400 });
    }

    const referrer = await User.findOne({ referralCode: code });
    if (!referrer) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_REFERRAL_CODE', message: 'Referral code does not exist.' }
      }, { status: 400 });
    }

    user.referredBy = code;
    await user.save();

    const bonusAmount = 50.0;

    // Credit bonus to new user
    const { wallet: newUserWallet } = await creditWallet({
      userId: user._id,
      amount: bonusAmount,
      type: 'BONUS_CREDIT',
      subBalanceType: 'bonus',
      referenceId: code,
      description: `Signup referral bonus from code ${code}`
    });

    // Credit bonus to referrer as well
    await creditWallet({
      userId: referrer._id,
      amount: bonusAmount,
      type: 'BONUS_CREDIT',
      subBalanceType: 'bonus',
      referenceId: user._id.toString(),
      description: `Referral reward for inviting ${user.username}`
    });

    return NextResponse.json({
      success: true,
      message: `Referral applied! ₹${bonusAmount} bonus credited to your wallet.`,
      data: {
        bonus_credited: bonusAmount,
        new_bonus_balance: newUserWallet.bonusBalance
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
