import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, otp } = body;

    // Simulated 2FA / OTP verification engine for sensitive superadmin actions
    if (action === 'GENERATE') {
      return NextResponse.json({
        status: true,
        message: 'Security OTP dispatched to admin registered email/phone (Demo OTP: 998877)',
        data: { otpRequired: true, demoOtp: '998877' }
      });
    }

    if (action === 'VERIFY') {
      if (otp === '998877' || otp === '123456') {
        return NextResponse.json({
          status: true,
          message: 'OTP verified successfully'
        });
      } else {
        return NextResponse.json({
          status: false,
          message: 'Invalid security OTP code'
        }, { status: 400 });
      }
    }

    return NextResponse.json({ status: false, message: 'Invalid OTP action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
