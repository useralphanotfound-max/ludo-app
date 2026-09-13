import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { WithdrawalRequest } from '@/lib/models/WithdrawalRequest';
import { getAuthUser } from '@/lib/authHelper';
import mongoose from 'mongoose';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      }, { status: 401 });
    }

    const { id } = await params;

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { userId: user._id };
    }

    const withdrawal = await WithdrawalRequest.findOne(query).lean();
    if (!withdrawal) {
      return NextResponse.json({
        success: false,
        error: { code: 'WITHDRAWAL_NOT_FOUND', message: 'Withdrawal record not found' }
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      status: true,
      data: {
        withdrawal_id: withdrawal._id.toString(),
        amount: withdrawal.amountRs,
        upi_id: withdrawal.upiId,
        status: withdrawal.status,
        rejection_reason: withdrawal.rejectionReason || null,
        created_at: withdrawal.createdAt
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
