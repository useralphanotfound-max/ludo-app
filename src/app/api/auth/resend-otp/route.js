import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'royal-ludo-super-secret-jwt-key-2026';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { phone, mobile } = body;
    const targetPhone = (phone || mobile || '').toString().trim();

    if (!targetPhone) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_PHONE', message: 'Please enter a valid phone number' }
      }, { status: 400 });
    }

    const otpToken = jwt.sign(
      { phone: targetPhone, action: 'VERIFY_OTP' },
      JWT_SECRET,
      { expiresIn: '60s' }
    );

    return NextResponse.json({
      success: true,
      message: 'OTP resent successfully',
      data: {
        otp_token: otpToken,
        expires_in: 60,
        phone: targetPhone
      }
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
