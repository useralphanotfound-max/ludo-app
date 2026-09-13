import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Deposit } from '@/lib/models/Deposit';
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
      query = { $or: [{ _id: id }, { utrNumber: id }] };
    } else {
      query = { utrNumber: id };
    }

    const deposit = await Deposit.findOne(query).lean();
    if (!deposit) {
      return NextResponse.json({
        success: false,
        error: { code: 'DEPOSIT_NOT_FOUND', message: 'Deposit record not found' }
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      status: true,
      data: {
        deposit_id: deposit._id.toString(),
        amount: deposit.amountRs,
        utr_number: deposit.utrNumber,
        status: deposit.status,
        rejection_reason: deposit.rejectionReason || null,
        created_at: deposit.createdAt
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
