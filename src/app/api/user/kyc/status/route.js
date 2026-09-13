import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { getAuthUser } from '@/lib/authHelper';

export async function GET(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      }, { status: 401 });
    }

    const kycDetails = user.kycDetails || {};

    return NextResponse.json({
      success: true,
      status: true,
      data: {
        kyc_status: user.kycStatus || 'NONE',
        is_verified: user.kycStatus === 'VERIFIED',
        submitted_at: kycDetails.submittedAt || null,
        rejected_reason: kycDetails.rejectedReason || '',
        aadhaar_masked: kycDetails.aadhaarNumber ? `XXXX-XXXX-${kycDetails.aadhaarNumber.slice(-4)}` : null,
        pan_masked: kycDetails.panNumber ? `XXXXX${kycDetails.panNumber.slice(-4)}` : null
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
