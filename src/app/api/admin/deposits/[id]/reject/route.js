import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Deposit } from '@/lib/models/Deposit';
import mongoose from 'mongoose';

export async function POST(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Deposit ID parameter missing' }
      }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const reason = body.reason || body.rejection_reason || 'Invalid or unverified UTR number';

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { depositId: id }, { utrNumber: id }] };
    } else {
      query = { $or: [{ depositId: id }, { utrNumber: id }] };
    }

    const deposit = await Deposit.findOne(query);
    if (!deposit) {
      return NextResponse.json({
        success: false,
        error: { code: 'DEPOSIT_NOT_FOUND', message: 'Deposit record not found' }
      }, { status: 404 });
    }

    if (deposit.status === 'APPROVED') {
      return NextResponse.json({
        success: false,
        error: { code: 'ALREADY_PROCESSED', message: 'Cannot reject an already approved deposit.' }
      }, { status: 400 });
    }

    deposit.status = 'REJECTED';
    deposit.rejectionReason = reason;
    await deposit.save();

    return NextResponse.json({
      success: true,
      status: true,
      message: `Deposit request marked as REJECTED.`,
      data: {
        deposit_id: deposit.depositId,
        reason: deposit.rejectionReason,
        status: 'REJECTED'
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
