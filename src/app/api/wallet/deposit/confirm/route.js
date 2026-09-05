import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Deposit } from '@/lib/models/Deposit';
import { getAuthUser } from '@/lib/authHelper';
import { creditWallet } from '@/lib/walletHelper';

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
    const { transaction_id, transactionId, deposit_id, depositId, utr_number, utrNumber, gateway_payment_id } = body;

    const depId = transaction_id || transactionId || deposit_id || depositId;
    const utr = (utr_number || utrNumber || gateway_payment_id || '').toString().trim();

    let deposit = null;
    if (depId) {
      deposit = await Deposit.findOne({ depositId: depId });
    }

    if (!deposit) {
      // Find latest INITIATED deposit for user if depId is generic or not found
      deposit = await Deposit.findOne({ userId: user._id, status: 'INITIATED' }).sort({ createdAt: -1 });
    }

    if (!deposit) {
      return NextResponse.json({
        success: false,
        error: { code: 'DEPOSIT_NOT_FOUND', message: 'No active deposit request found for confirmation.' }
      }, { status: 404 });
    }

    if (deposit.status === 'APPROVED') {
      return NextResponse.json({
        success: false,
        error: { code: 'ALREADY_PROCESSED', message: 'This deposit has already been processed and credited.' }
      }, { status: 400 });
    }

    // Auto credit deposit to user wallet as requested
    deposit.utrNumber = utr || `UTR_${Date.now()}`;
    deposit.status = 'APPROVED';
    deposit.approvedAt = new Date();
    deposit.performedBy = 'AUTO_CREDIT';
    await deposit.save();

    const { wallet } = await creditWallet({
      userId: user._id,
      amount: deposit.amount,
      type: 'DEPOSIT',
      subBalanceType: 'deposit',
      referenceId: deposit.depositId,
      description: `UPI Deposit of ₹${deposit.amount} (Ref: ${deposit.utrNumber})`,
      performedBy: 'AUTO_CREDIT'
    });

    const newTotal = wallet.depositBalance + wallet.winningBalance + wallet.bonusBalance;

    return NextResponse.json({
      success: true,
      message: `₹${deposit.amount} added to your wallet`,
      data: {
        transaction_id: deposit.depositId,
        amount: deposit.amount,
        new_balance: newTotal,
        status: 'SUCCESS'
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
