import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Wallet } from '@/lib/models/Wallet';
import { getAuthUser } from '@/lib/authHelper';

const AVATAR_MAP = {
  av1: 'https://cdn.royalludo.com/avatars/av1.png',
  av2: 'https://cdn.royalludo.com/avatars/av2.png',
  av3: 'https://cdn.royalludo.com/avatars/av3.png',
  av4: 'https://cdn.royalludo.com/avatars/av4.png',
  av5: 'https://cdn.royalludo.com/avatars/av5.png',
  av6: 'https://cdn.royalludo.com/avatars/av6.png'
};

export async function GET(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      }, { status: 401 });
    }

    let wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) {
      wallet = await Wallet.create({ userId: user._id });
    }

    const totalBalance = (wallet.depositBalance || 0) + (wallet.winningBalance || 0) + (wallet.bonusBalance || 0);
    const gamesPlayed = user.stats?.played || 0;
    const wins = user.stats?.won || 0;
    const losses = user.stats?.lost || 0;
    const winRate = gamesPlayed > 0 ? Number(((wins / gamesPlayed) * 100).toFixed(2)) : 0;

    return NextResponse.json({
      success: true,
      data: {
        id: user._id,
        phone: user.mobile,
        username: user.username,
        avatar_id: user.avatarId || 'av1',
        avatar_url: user.avatarUrl || 'https://cdn.royalludo.com/avatars/av1.png',
        balance: totalBalance,
        withdrawal_balance: wallet.winningBalance || 0,
        bonus_balance: wallet.bonusBalance || 0,
        pending_balance: wallet.pendingBalance || 0,
        level: user.level || 1,
        stats: {
          games_played: gamesPlayed,
          wins: wins,
          losses: losses,
          win_rate: winRate
        },
        referral_code: user.referralCode,
        is_kyc_verified: user.kycStatus === 'VERIFIED',
        created_at: user.createdAt
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      }, { status: 401 });
    }

    const body = await req.json();
    const { username, avatar_id, avatarId } = body;
    const selectedAvatarId = avatar_id || avatarId;

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username: username.trim() });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'USERNAME_TAKEN',
            message: 'This username is already taken. Please choose another.'
          }
        }, { status: 422 });
      }
      user.username = username.trim();
    }

    if (selectedAvatarId) {
      user.avatarId = selectedAvatarId;
      user.avatarUrl = AVATAR_MAP[selectedAvatarId] || `https://cdn.royalludo.com/avatars/${selectedAvatarId}.png`;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        username: user.username,
        avatar_id: user.avatarId || 'av1',
        avatar_url: user.avatarUrl
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
