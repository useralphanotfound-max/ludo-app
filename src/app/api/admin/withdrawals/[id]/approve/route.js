import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { WithdrawalRequest } from '@/lib/models/WithdrawalRequest';
import { Wallet } from '@/lib/models/Wallet';
import { Transaction } from '@/lib/models/Transaction';
import mongoose from 'mongoose';

export async function POST(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Withdrawal ID parameter missing' }
      }, { status: 400 });
    }

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { requestId: id }] };
    } else {
      query = { requestId: id };
    }

    const withdrawal = await WithdrawalRequest.findOne(query);
    if (!withdrawal) {
      return NextResponse.json({
        success: false,
        error: { code: 'WITHDRAWAL_NOT_FOUND', message: 'Withdrawal request not found' }
      }, { status: 404 });
    }

    if (withdrawal.status === 'APPROVED') {
      return NextResponse.json({
        success: false,
        error: { code: 'ALREADY_PROCESSED', message: 'This withdrawal has already been approved.' }
      }, { status: 400 });
    }

    if (withdrawal.status !== 'PENDING_APPROVAL') {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_STATUS', message: `Cannot approve withdrawal in ${withdrawal.status} status.` }
      }, { status: 400 });
    }

    const withdrawAmt = withdrawal.amount || (withdrawal.amountPaise ? withdrawal.amountPaise / 100 : 0);

    withdrawal.status = 'APPROVED';
    withdrawal.processedBy = 'admin';
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    const wallet = await Wallet.findOne({ userId: withdrawal.userId });
    if (wallet) {
      wallet.lockedBalance = Math.max(0, wallet.lockedBalance - withdrawAmt);
      await wallet.save();
    }

    await Transaction.create({
      userId: withdrawal.userId,
      type: 'WITHDRAWAL',
      amount: withdrawAmt,
      subBalanceType: 'winning',
      status: 'SUCCESS',
      referenceId: withdrawal.requestId || withdrawal._id.toString(),
      description: `Withdrawal payout of ₹${withdrawAmt} via ${withdrawal.payoutMethod || 'UPI'} approved by Admin`,
      performedBy: 'admin'
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      status: true,
      message: `Withdrawal payout of ₹${withdrawAmt} approved successfully.`,
      data: {
        withdrawal_id: withdrawal.requestId || withdrawal._id.toString(),
        amount: withdrawAmt,
        status: 'APPROVED',
        processed_at: withdrawal.processedAt
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
