import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Deposit } from '@/lib/models/Deposit';
import { creditWallet } from '@/lib/walletHelper';
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
        error: { code: 'ALREADY_PROCESSED', message: 'This deposit has already been approved and credited.' }
      }, { status: 400 });
    }

    deposit.status = 'APPROVED';
    deposit.approvedAt = new Date();
    await deposit.save();

    // Atomically credit funds to user's deposit wallet balance
    const result = await creditWallet({
      userId: deposit.userId,
      amount: deposit.amount,
      type: 'DEPOSIT',
      subBalanceType: 'deposit',
      referenceId: deposit.utrNumber || deposit.depositId,
      description: `Approved UPI Deposit (UTR: ${deposit.utrNumber || 'MANUAL'})`,
      performedBy: 'admin'
    });

    const newTotal = result.wallet.depositBalance + result.wallet.winningBalance + result.wallet.bonusBalance;

    return NextResponse.json({
      success: true,
      status: true,
      message: `Deposit of ₹${deposit.amount} approved and credited successfully.`,
      data: {
        deposit_id: deposit.depositId,
        user_id: deposit.userId.toString(),
        amount: deposit.amount,
        utr_number: deposit.utrNumber,
        new_balance: newTotal,
        deposit_balance: result.wallet.depositBalance,
        status: 'APPROVED'
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
