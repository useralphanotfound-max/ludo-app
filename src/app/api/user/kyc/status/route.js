import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    status: true,
    message: 'KYC verification is not required on this platform.',
    data: {
      is_kyc_required: false,
      is_verified: true,
      kyc_status: 'NOT_REQUIRED',
      submitted_at: null,
      rejected_reason: '',
      aadhaar_masked: null,
      pan_masked: null
    }
  }, { status: 200 });
}
