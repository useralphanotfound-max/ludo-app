import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { getAuthUser } from '@/lib/authHelper';

export async function POST(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      }, { status: 401 });
    }

    const body = await req.json();
    const { aadhaar_number, aadhaarNumber, pan_number, panNumber, selfie_image, selfieImage, document_url } = body;

    const targetAadhaar = aadhaar_number || aadhaarNumber || '';
    const targetPan = pan_number || panNumber || '';
    const targetSelfie = selfie_image || selfieImage || '';

    if (!targetAadhaar && !targetPan) {
      return NextResponse.json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Aadhaar number or PAN number is required' }
      }, { status: 400 });
    }

    user.kycStatus = 'PENDING';
    user.kycDetails = {
      aadhaarNumber: targetAadhaar,
      panNumber: targetPan,
      selfieImage: targetSelfie,
      documentUrl: document_url || '',
      submittedAt: new Date(),
      rejectedReason: ''
    };

    await user.save();

    return NextResponse.json({
      success: true,
      status: true,
      message: 'KYC documents submitted successfully and pending verification.',
      data: {
        user_id: user._id,
        kyc_status: user.kycStatus,
        is_verified: false,
        submitted_at: user.kycDetails.submittedAt
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
