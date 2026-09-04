import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Deposit } from '@/lib/models/Deposit';
import { creditWallet } from '@/lib/walletHelper';

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const deposit = await Deposit.findOne({ $or: [{ _id: id }, { depositId: id }] });
    if (!deposit) {
      return NextResponse.json({
        success: false,
        error: { code: 'DEPOSIT_NOT_FOUND', message: 'Deposit record not found' }
      }, { status: 404 });
    }

    if (deposit.status === 'APPROVED') {
      return NextResponse.json({
        success: false,
        error: { code: 'ALREADY_APPROVED', message: 'This deposit has already been approved and credited.' }
      }, { status: 400 });
    }

    deposit.status = 'APPROVED';
    deposit.approvedAt = new Date();
    await deposit.save();

    // Credit funds to User's Deposit Wallet Balance!
    const result = await creditWallet({
      userId: deposit.userId,
      amount: deposit.amount,
      type: 'DEPOSIT',
      subBalanceType: 'deposit',
      referenceId: deposit.utrNumber || deposit.depositId,
      description: `Approved UPI Deposit (UTR: ${deposit.utrNumber || 'MANUAL'})`,
      performedBy: 'admin'
    });

    return NextResponse.json({
      success: true,
      message: `Deposit of ₹${deposit.amount} approved and credited to user's wallet successfully.`,
      data: {
        deposit_id: deposit.depositId,
        user_id: deposit.userId.toString(),
        amount: deposit.amount,
        utr_number: deposit.utrNumber,
        new_balance: result.wallet.depositBalance + result.wallet.winningBalance + result.wallet.bonusBalance,
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
