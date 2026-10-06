import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { getAuthUser } from '@/lib/authHelper';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'royal-ludo-super-secret-jwt-key-2026';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));
    const { username, alias, avatar_id, avatarId, avatar_url, avatarUrl } = body;

    // Get auth user from token header or registration token
    let user = await getAuthUser(req);

    if (!user) {
      const authHeader = req.headers.get('authorization');
      const token = authHeader ? authHeader.replace('Bearer ', '').trim() : (body.registration_token || body.registrationToken);
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          if (decoded && decoded.userId) {
            user = await User.findById(decoded.userId);
          }
        } catch (e) {}
      }
    }

    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication token required' }
      }, { status: 401 });
    }

    const newUsername = (username || alias || '').toString().trim();
    if (newUsername && newUsername.length >= 3) {
      const existing = await User.findOne({ username: newUsername, _id: { $ne: user._id } });
      if (existing) {
        return NextResponse.json({
          success: false,
          error: { code: 'USERNAME_TAKEN', message: 'Username is already taken' }
        }, { status: 400 });
      }
      user.username = newUsername;
    }

    if (avatar_id || avatarId) user.avatarId = avatar_id || avatarId;
    if (avatar_url || avatarUrl) user.avatarUrl = avatar_url || avatarUrl;

    user.status = 'ACTIVE';
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id.toString(),
          alias: user.username,
          username: user.username,
          mobile: user.mobile,
          avatar_url: user.avatarUrl,
          avatar_id: user.avatarId
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
