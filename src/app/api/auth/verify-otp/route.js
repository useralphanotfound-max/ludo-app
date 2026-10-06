import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Wallet } from '@/lib/models/Wallet';
import { GameSettings } from '@/lib/models/GameSettings';
import { Transaction } from '@/lib/models/Transaction';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'royal-ludo-super-secret-jwt-key-2026';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));
    const { mobile, phone, otp, otp_token, otpToken } = body;

    const targetMobile = (mobile || phone || '').toString().trim();
    const enteredOtp = (otp || '').toString().trim();
    const token = otp_token || otpToken;

    if (!enteredOtp) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_OTP', message: 'Please enter a valid OTP' }
      }, { status: 400 });
    }

    let decoded = null;
    if (token) {
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        return NextResponse.json({
          success: false,
          error: { code: 'OTP_EXPIRED', message: 'OTP session expired. Please request a new OTP.' }
        }, { status: 400 });
      }
    }

    let settings = await GameSettings.findOne({ key: 'global_settings' });
    if (!settings) settings = await GameSettings.create({ key: 'global_settings' });

    if (settings.useDefaultOtp) {
      if (enteredOtp !== settings.defaultOtpCode && enteredOtp !== '1234' && enteredOtp !== '123456') {
        return NextResponse.json({
          success: false,
          error: { code: 'INVALID_OTP', message: `Incorrect OTP. Default testing OTP is ${settings.defaultOtpCode}` }
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
        error: { code: 'USER_NOT_FOUND', message: 'User session not found' }
      }, { status: 404 });
    }

    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    user.currentSessionId = sessionId;
    user.status = 'ACTIVE';
    user.lastLoginAt = new Date();
    await user.save();

    let wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) {
      wallet = await Wallet.create({
        userId: user._id,
        depositBalance: 0,
        winningBalance: 0,
        bonusBalance: 0
      });
    }

    const accessToken = jwt.sign(
      { userId: user._id, role: user.role || 'USER', sessionId },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const totalBalance = (wallet.depositBalance || 0) + (wallet.winningBalance || 0) + (wallet.bonusBalance || 0);

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        access_token: accessToken,
        user: {
          id: user._id.toString(),
          alias: user.username || `Player_${user.mobile.slice(-4)}`,
          username: user.username || `Player_${user.mobile.slice(-4)}`,
          mobile: user.mobile,
          avatar_url: user.avatarUrl || 'assets/images/avatars/avatar1.png',
          wallet_balance: totalBalance,
          deposit_balance: wallet.depositBalance || 0,
          winning_balance: wallet.winningBalance || 0,
          bonus_balance: wallet.bonusBalance || 0,
          kyc_status: user.kycStatus === 'VERIFIED' ? 'APPROVED' : (user.kycStatus || 'NOT_SUBMITTED'),
          referral_code: user.referralCode
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
