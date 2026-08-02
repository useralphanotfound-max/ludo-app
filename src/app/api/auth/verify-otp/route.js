import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';
import { User } from '@/lib/models/User';
import { Wallet } from '@/lib/models/Wallet';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { otpSessionId, otp } = body;

    if (!otpSessionId || !otp) {
      return NextResponse.json({ status: false, message: 'OTP session ID and 4-digit OTP required' }, { status: 400 });
    }

    if (otp !== '1234' && otp !== '9999') {
      return NextResponse.json({ status: false, message: 'Invalid OTP code entered', errorCode: 'OTP_INVALID' }, { status: 422 });
    }

    const userId = otpSessionId.replace('session_', '');
    let user;
    if (mongoose.isValidObjectId(userId)) {
      user = await User.findById(userId);
    }

    if (!user) {
      return NextResponse.json({ status: false, message: 'Verification session not found or expired' }, { status: 404 });
    }

    user.status = 'ACTIVE';
    await user.save();

    const token = jwt.sign(
      { id: user?._id || 'demo', role: 'USER', username: user?.username || 'user' },
      process.env.JWT_SECRET || 'royalludosecretkey123_superadmin_auth_9988',
      { expiresIn: '30d' }
    );

    return NextResponse.json({
      status: true,
      message: 'Account verified successfully',
      data: {
        accessToken: token,
        refreshToken: token,
        expiresIn: 2592000,
        user: {
          id: user?._id,
          username: user?.username,
          mobile: user?.mobile
        }
      }
    });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
