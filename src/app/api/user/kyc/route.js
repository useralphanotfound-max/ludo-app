import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    success: true,
    status: true,
    message: 'KYC verification is not required on this platform. You have full instant access.',
    data: {
      is_kyc_required: false,
      is_verified: true,
      kyc_status: 'NOT_REQUIRED'
    }
  }, { status: 200 });
}

export async function GET() {
  return NextResponse.json({
    success: true,
    status: true,
    message: 'KYC verification is not required on this platform.',
    data: {
      is_kyc_required: false,
      is_verified: true,
      kyc_status: 'NOT_REQUIRED'
    }
  }, { status: 200 });
}
