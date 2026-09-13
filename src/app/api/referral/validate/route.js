import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { referral_code, referralCode } = body;

    const targetCode = (referral_code || referralCode || '').toString().trim().toUpperCase();
    if (!targetCode) {
      return NextResponse.json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Referral code is required' }
      }, { status: 400 });
    }

    const referrer = await User.findOne({ referralCode: targetCode }).select('username avatarId').lean();
    if (!referrer) {
      return NextResponse.json({
        success: false,
        status: false,
        data: { is_valid: false, message: 'Invalid referral code' }
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      status: true,
      data: {
        is_valid: true,
        referral_code: targetCode,
        referrer_username: referrer.username
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
