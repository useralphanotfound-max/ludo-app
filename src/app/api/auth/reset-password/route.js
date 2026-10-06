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
    const body = await req.json();
    const { mobile, phone, otp, reset_token, resetToken, otp_token, otpToken, new_password, newPassword, confirm_password, confirmPassword } = body;

    const targetMobile = (mobile || phone || '').toString().trim();
    const enteredOtp = (otp || '').toString().trim();
    const targetToken = reset_token || resetToken || otp_token || otpToken;
    const targetNewPassword = (new_password || newPassword || '').toString().trim();
    const targetConfirmPassword = (confirm_password || confirmPassword || targetNewPassword).toString().trim();

    if (!targetNewPassword || targetNewPassword.length < 6) {
      return NextResponse.json({
        success: false,
        status: false,
        error: { code: 'INVALID_PASSWORD', message: 'Password must be at least 6 characters long' }
      }, { status: 400 });
    }

    if (targetNewPassword !== targetConfirmPassword) {
      return NextResponse.json({
        success: false,
        status: false,
        error: { code: 'PASSWORD_MISMATCH', message: 'New password and confirm password do not match' }
      }, { status: 400 });
    }

    if (!enteredOtp || (enteredOtp.length !== 4 && enteredOtp.length !== 6)) {
      return NextResponse.json({
        success: false,
        status: false,
        error: { code: 'INVALID_OTP', message: 'Please enter a valid 4-digit or 6-digit OTP' }
      }, { status: 400 });
    }

    let settings = await GameSettings.findOne({ key: 'global_settings' });
    if (!settings) settings = await GameSettings.create({ key: 'global_settings' });

    if (settings.useDefaultOtp) {
      if (enteredOtp !== settings.defaultOtpCode && enteredOtp !== '1234' && enteredOtp !== '123456') {
        return NextResponse.json({
          success: false,
          status: false,
          error: { code: 'INVALID_OTP', message: `Incorrect OTP. Default testing OTP is ${settings.defaultOtpCode}` }
        }, { status: 400 });
      }
    }

    let decoded = null;
    if (targetToken) {
      try {
        decoded = jwt.verify(targetToken, JWT_SECRET);
      } catch (err) {
        // Continue if mobile matches
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
        status: false,
        error: { code: 'USER_NOT_FOUND', message: 'Password reset session expired or user not found' }
      }, { status: 404 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(targetNewPassword, salt);

    user.passwordHash = passwordHash;
    user.rawPassword = targetNewPassword;
    await user.save();

    return NextResponse.json({
      success: true,
      status: true,
      message: 'Password reset successfully! Please login with your new password.',
      data: {
        mobile: user.mobile
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
