import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { getOrCreateWallet, creditWallet } from '@/lib/walletHelper';
import { GameSettings } from '@/lib/models/GameSettings';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'royal-ludo-super-secret-jwt-key-2026';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { username, avatar_id, avatar_url, avatarId, avatarUrl } = body;

    const authHeader = req.headers.get('authorization');
    const tokenFromHeader = authHeader ? authHeader.replace('Bearer ', '').trim() : null;
    const registrationToken = tokenFromHeader || body.registration_token || body.registrationToken;

    if (!registrationToken) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Registration token is required' }
      }, { status: 401 });
    }

    let decoded = null;
    try {
      decoded = jwt.verify(registrationToken, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({
        success: false,
        error: { code: 'TOKEN_EXPIRED', message: 'Profile setup session expired. Please verify OTP again.' }
      }, { status: 401 });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User record not found' }
      }, { status: 404 });
    }

    const cleanUsername = (username || '').toString().trim();
    if (!cleanUsername || cleanUsername.length < 3) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_USERNAME', message: 'Username must be at least 3 characters long' }
      }, { status: 400 });
    }

    // Check if username is taken by another user
    const usernameTaken = await User.findOne({
      username: cleanUsername,
      _id: { $ne: user._id }
    });

    if (usernameTaken) {
      return NextResponse.json({
        success: false,
        error: { code: 'USERNAME_TAKEN', message: 'This username is already taken. Please choose another.' }
      }, { status: 422 });
    }

    const selectedAvatarId = avatar_id || avatarId || 'av1';
    const finalAvatarUrl = avatar_url || avatarUrl || `https://cdn.royalludo.com/avatars/${selectedAvatarId}.png`;

    user.username = cleanUsername;
    user.avatarUrl = finalAvatarUrl;
    user.status = 'ACTIVE';
    await user.save();

    // Initialize Wallet
    const wallet = await getOrCreateWallet(user._id);

    // Apply Referral Bonus if referred
    if (user.referredBy) {
      let settings = await GameSettings.findOne({ key: 'global_settings' });
      const refBonus = settings?.referralBonusRs || 50;
      await creditWallet({
        userId: user._id,
        amount: refBonus,
        type: 'BONUS_CREDIT',
        subBalanceType: 'bonus',
        description: `Sign-up referral bonus (Code: ${user.referredBy})`
      });
    }

    // Issue permanent JWT Access & Refresh Tokens
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

    const updatedWallet = await getOrCreateWallet(user._id);

    return NextResponse.json({
      success: true,
      message: 'Profile created successfully! Welcome to Royal Ludo.',
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 2592000,
        user: {
          id: user._id.toString(),
          mobile: user.mobile,
          username: user.username,
          avatar_url: user.avatarUrl,
          balance: updatedWallet.depositBalance + updatedWallet.winningBalance + updatedWallet.bonusBalance,
          deposit_balance: updatedWallet.depositBalance,
          winning_balance: updatedWallet.winningBalance,
          bonus_balance: updatedWallet.bonusBalance,
          level: user.level || 1,
          referral_code: user.referralCode
        }
      }
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
