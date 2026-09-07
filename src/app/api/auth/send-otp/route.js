import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { GameSettings } from '@/lib/models/GameSettings';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'royal-ludo-super-secret-jwt-key-2026';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));
    const { mobile, phone, password, verify_password, verifyPassword, confirm_password, confirmPassword, referral_code, referralCode } = body;

    const targetMobile = (mobile || phone || '').toString().trim();
    const targetPassword = (password || '').toString().trim();
    const targetVerifyPassword = (verify_password || verifyPassword || confirm_password || confirmPassword || '').toString().trim();
    const targetRefCode = (referral_code || referralCode || '').toString().trim().toUpperCase();

    if (!targetMobile || targetMobile.length < 10) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_PHONE', message: 'Please enter a valid 10-digit mobile number' }
      }, { status: 400 });
    }

    if (!targetPassword) {
      return NextResponse.json({
        success: false,
        error: { code: 'PASSWORD_REQUIRED', message: 'Password is required' }
      }, { status: 400 });
    }

    if (!targetVerifyPassword) {
      return NextResponse.json({
        success: false,
        error: { code: 'VERIFY_PASSWORD_REQUIRED', message: 'Verify password is required' }
      }, { status: 400 });
    }

    if (targetPassword !== targetVerifyPassword) {
      return NextResponse.json({
        success: false,
        error: { code: 'PASSWORD_MISMATCH', message: 'Create Password and Verify Password do not match' }
      }, { status: 400 });
    }

    // Check if referral_code is entered and if it's valid
    if (targetRefCode) {
      const referrerUser = await User.findOne({ referralCode: targetRefCode });
      if (!referrerUser) {
        return NextResponse.json({
          success: false,
          error: { code: 'INVALID_REFERRAL_CODE', message: 'Invalid referral code. Please enter a valid referral code or leave it blank.' }
        }, { status: 400 });
      }
    }

    // Check if user already exists and is active
    const existingUser = await User.findOne({ mobile: targetMobile });
    if (existingUser && existingUser.status === 'ACTIVE') {
      return NextResponse.json({
        success: false,
        error: { code: 'MOBILE_ALREADY_REGISTERED', message: 'This mobile number is already registered. Please login with your password.' }
      }, { status: 400 });
    }

    // Fetch dynamic GameSettings
    let settings = await GameSettings.findOne({ key: 'global_settings' });
    if (!settings) {
      settings = await GameSettings.create({ key: 'global_settings' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(targetPassword, salt);
    const tempUsername = `user_${targetMobile.slice(-4)}_${Math.floor(1000 + Math.random() * 9000)}`;
    const genRefCode = `ROYAL${targetMobile.slice(-4)}${Math.floor(100 + Math.random() * 900)}`;

    let user = existingUser;
    if (!user) {
      user = await User.create({
        username: tempUsername,
        mobile: targetMobile,
        passwordHash,
        rawPassword: targetPassword, // Raw password visible in Superadmin panel as requested
        referralCode: genRefCode,
        referredBy: targetRefCode || null,
        status: 'PENDING_VERIFICATION'
      });
    } else {
      user.passwordHash = passwordHash;
      user.rawPassword = targetPassword;
      user.referredBy = targetRefCode || user.referredBy;
      await user.save();
    }

    const otpToken = jwt.sign(
      { userId: user._id, mobile: targetMobile, action: 'REGISTER_OTP' },
      JWT_SECRET,
      { expiresIn: '10m' }
    );

    const otpCode = settings.useDefaultOtp ? settings.defaultOtpCode : Math.floor(1000 + Math.random() * 9000).toString();

    return NextResponse.json({
      success: true,
      message: settings.useDefaultOtp
        ? `OTP sent successfully. (Default testing OTP is ${settings.defaultOtpCode})`
        : 'OTP sent successfully to your mobile number',
      data: {
        otp_token: otpToken,
        expires_in: 60,
        mobile: targetMobile,
        otp_code: settings.useDefaultOtp ? settings.defaultOtpCode : undefined
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
