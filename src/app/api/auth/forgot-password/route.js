import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { mobile } = body;

    if (!mobile) {
      return NextResponse.json({ status: false, message: 'Mobile number required' }, { status: 400 });
    }

    const user = await User.findOne({ mobile });
    if (!user) {
      return NextResponse.json({ status: false, message: 'Mobile number not registered' }, { status: 404 });
    }

    const otpSessionId = 'session_' + Math.random().toString(36).substring(2, 12);

    return NextResponse.json({
      status: true,
      message: 'OTP sent to mobile for password reset',
      data: {
        otpSessionId,
        otpExpiresInSec: 120,
        resendAvailableInSec: 60
      }
    });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
