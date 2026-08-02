import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { otpSessionId, otp, newPassword, confirmPassword } = body;

    if (!newPassword || newPassword !== confirmPassword) {
      return NextResponse.json({ status: false, message: 'Passwords do not match or missing' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    const userId = otpSessionId ? otpSessionId.replace('session_', '') : '';
    let user;
    if (mongoose.isValidObjectId(userId)) {
      user = await User.findById(userId);
    }

    if (!user) {
      return NextResponse.json({ status: false, message: 'Reset password session not found or expired' }, { status: 404 });
    }

    user.passwordHash = passwordHash;
    await user.save();

    return NextResponse.json({
      status: true,
      message: 'Password reset successfully. Please login with your new password.'
    });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
