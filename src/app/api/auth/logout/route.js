import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { getAuthUser } from '@/lib/authHelper';

export async function POST(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (user) {
      user.fcmToken = '';
      await user.save();
    }

    return NextResponse.json({
      success: true,
      status: true,
      message: 'User logged out successfully. Session invalidated.',
      data: { logged_out: true }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: true,
      status: true,
      message: 'Logged out successfully',
      data: { logged_out: true }
    }, { status: 200 });
  }
}
