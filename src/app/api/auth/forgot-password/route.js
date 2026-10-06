import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { GameSettings } from '@/lib/models/GameSettings';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'royal-ludo-super-secret-jwt-key-2026';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { mobile, phone } = body;

    const targetMobile = (mobile || phone || '').toString().trim();
    if (!targetMobile || targetMobile.length < 10) {
      return NextResponse.json({
        success: false,
        status: false,
        error: { code: 'INVALID_PHONE', message: 'Please enter a valid 10-digit registered mobile number' }
      }, { status: 400 });
    }

    const user = await User.findOne({ mobile: targetMobile });
    if (!user) {
      return NextResponse.json({
        success: false,
        status: false,
        error: { code: 'USER_NOT_FOUND', message: 'This mobile number is not registered.' }
      }, { status: 404 });
    }

    let settings = await GameSettings.findOne({ key: 'global_settings' });
    if (!settings) settings = await GameSettings.create({ key: 'global_settings' });

    const resetToken = jwt.sign(
      { userId: user._id, mobile: targetMobile, action: 'RESET_PASSWORD' },
      JWT_SECRET,
      { expiresIn: '10m' }
    );

    const defaultOtp = settings.useDefaultOtp ? settings.defaultOtpCode : '1234';

    return NextResponse.json({
      success: true,
      status: true,
      message: settings.useDefaultOtp
        ? `Reset OTP sent. (Testing OTP: ${defaultOtp})`
        : 'Password reset OTP sent to your registered mobile number.',
      data: {
        mobile: targetMobile,
        reset_token: resetToken,
        otp_token: resetToken,
        otp_code: settings.useDefaultOtp ? defaultOtp : undefined,
        expires_in_sec: 120
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      status: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
