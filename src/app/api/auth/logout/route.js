import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getAuthUser } from '@/lib/authHelper';

export async function POST(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (user) {
      user.currentSessionId = null;
      user.fcmToken = '';
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    }, { status: 200 });
  }
}
