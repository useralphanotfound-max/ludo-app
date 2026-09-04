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
    const body = await req.json();
    const { mobile, phone, password } = body;

    const targetMobile = (mobile || phone || '').toString().trim();
    const targetPassword = (password || '').toString().trim();

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

    // Check if user profile setup was incomplete
    if (user.status === 'PENDING_VERIFICATION') {
      const regToken = jwt.sign(
        { userId: user._id, mobile: user.mobile, action: 'COMPLETE_PROFILE' },
        JWT_SECRET,
        { expiresIn: '30m' }
      );
      return NextResponse.json({
        success: true,
        message: 'Phone verified, but profile setup is pending',
        data: {
          is_profile_pending: true,
          registration_token: regToken
        }
      }, { status: 200 });
    }

    // Ensure rawPassword is set if missing
    if (!user.rawPassword) {
      user.rawPassword = targetPassword;
      await user.save();
    }

    const accessToken = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id, action: 'REFRESH' },
      JWT_SECRET,
      { expiresIn: '90d' }
    );

    const wallet = await getOrCreateWallet(user._id);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 2592000,
        user: {
          id: user._id.toString(),
          username: user.username,
          mobile: user.mobile,
          avatar_url: user.avatarUrl,
          role: user.role,
          balance: wallet.depositBalance + wallet.winningBalance + wallet.bonusBalance,
          deposit_balance: wallet.depositBalance,
          winning_balance: wallet.winningBalance,
          bonus_balance: wallet.bonusBalance,
          level: user.level || 1,
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
