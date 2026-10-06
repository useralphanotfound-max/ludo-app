import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { getOrCreateWallet } from '@/lib/walletHelper';

const JWT_SECRET = process.env.JWT_SECRET || 'royal-ludo-super-secret-jwt-key-2026';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));
    const { mobile, phone, password, fcm_token, fcmToken, device_id, deviceId, platform, deviceType } = body;

    const targetMobile = (mobile || phone || '').toString().trim();
    const targetPassword = (password || '').toString().trim();
    const targetFcmToken = fcm_token || fcmToken || '';
    const targetDeviceId = device_id || deviceId || '';

    if (!targetMobile || !targetPassword) {
      return NextResponse.json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Mobile number and password are required' }
      }, { status: 400 });
    }

    const user = await User.findOne({ mobile: targetMobile });
    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid mobile number or password' }
      }, { status: 401 });
    }

    if (user.status === 'BANNED') {
      return NextResponse.json({
        success: false,
        error: { code: 'ACCOUNT_BANNED', message: 'Your account has been banned. Please contact support.' }
      }, { status: 403 });
    }

    const isMatch = await bcrypt.compare(targetPassword, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid mobile number or password' }
      }, { status: 401 });
    }

    if (user.status === 'PENDING_VERIFICATION') {
      user.status = 'ACTIVE';
    }

    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    user.currentSessionId = sessionId;

    if (targetFcmToken) user.fcmToken = targetFcmToken;
    if (targetDeviceId) user.deviceId = targetDeviceId;
    if (platform || deviceType) user.deviceType = platform || deviceType;
    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = jwt.sign(
      { userId: user._id, username: user.username, role: user.role, sessionId },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const wallet = await getOrCreateWallet(user._id);
    const totalBalance = wallet.depositBalance + wallet.winningBalance + wallet.bonusBalance;

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        access_token: accessToken,
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
