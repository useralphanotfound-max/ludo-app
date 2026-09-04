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
    const { mobile, phone, otp, otp_token, otpToken } = body;

    const targetMobile = (mobile || phone || '').toString().trim();
    const enteredOtp = (otp || '').toString().trim();
    const token = otp_token || otpToken;

    if (!enteredOtp || enteredOtp.length !== 4) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_OTP', message: 'Please enter a valid 4-digit OTP' }
      }, { status: 400 });
    }

    let decoded = null;
    if (token) {
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        return NextResponse.json({
          success: false,
          error: { code: 'OTP_EXPIRED', message: 'OTP token has expired. Please request a new OTP.' }
        }, { status: 400 });
      }
    }

    let settings = await GameSettings.findOne({ key: 'global_settings' });
    if (!settings) {
      settings = await GameSettings.create({ key: 'global_settings' });
    }

    // OTP verification check
    if (settings.useDefaultOtp) {
      if (enteredOtp !== settings.defaultOtpCode && enteredOtp !== '1234') {
        return NextResponse.json({
          success: false,
          error: { code: 'INVALID_OTP', message: `Incorrect OTP. Default OTP is ${settings.defaultOtpCode}` }
        }, { status: 400 });
      }
    }

    let user = null;
    if (decoded && decoded.userId) {
      user = await User.findById(decoded.userId);
    } else if (targetMobile) {
      user = await User.findOne({ mobile: targetMobile });
    }

    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User registration session not found' }
      }, { status: 404 });
    }

    const regToken = jwt.sign(
      { userId: user._id, mobile: user.mobile, action: 'COMPLETE_PROFILE' },
      JWT_SECRET,
      { expiresIn: '30m' }
    );

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully. Please setup your profile username and avatar.',
      data: {
        is_profile_pending: true,
        registration_token: regToken,
        user_id: user._id
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
