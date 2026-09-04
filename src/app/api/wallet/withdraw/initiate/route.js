import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { WithdrawalRequest } from '@/lib/models/WithdrawalRequest';
import { debitWallet } from '@/lib/walletHelper';
import { GameSettings } from '@/lib/models/GameSettings';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'royal-ludo-super-secret-jwt-key-2026';

function getUserFromToken(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const userPayload = getUserFromToken(req);
    if (!userPayload) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication token required' }
      }, { status: 401 });
    }

    const body = await req.json();
    const { amount, withdrawal_method, upi_id, account_number, ifsc_code } = body;

    const withdrawAmt = Number(amount);
    if (!withdrawAmt || withdrawAmt <= 0) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_AMOUNT', message: 'Please enter a valid withdrawal amount' }
      }, { status: 400 });
    }

    let settings = await GameSettings.findOne({ key: 'global_settings' });
    const minWithdraw = settings?.minWithdrawRs || 100;

    if (withdrawAmt < minWithdraw) {
      return NextResponse.json({
        success: false,
        error: { code: 'MIN_WITHDRAWAL_LIMIT', message: `Minimum withdrawal amount is ₹${minWithdraw}` }
      }, { status: 400 });
    }

    // Debit wallet specifically from winningBalance (Strict No Negative Balance!)
    const { wallet, transaction } = await debitWallet({
      userId: userPayload.userId,
      amount: withdrawAmt,
      type: 'WITHDRAWAL',
      subBalanceType: 'winning',
      referenceId: `WD_${Date.now()}`,
      description: `Withdrawal Request of ₹${withdrawAmt} to ${withdrawal_method || 'UPI'}`
    });

    const withdrawal = await WithdrawalRequest.create({
      userId: userPayload.userId,
      requestId: `WR_${Date.now()}`,
      amount: withdrawAmt,
      payoutMethod: (withdrawal_method || 'UPI').toUpperCase(),
      payoutDetails: {
        upiId: upi_id || '',
        accountNumber: account_number || '',
        ifscCode: ifsc_code || ''
      },
      status: 'PENDING_APPROVAL'
    });

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted successfully and is pending approval.',
      data: {
        transaction_id: withdrawal.requestId,
        amount: withdrawAmt,
        remaining_winning_balance: wallet.winningBalance,
        status: 'PROCESSING',
        estimated_time: '24-48 hours'
      }
    }, { status: 200 });

  } catch (error) {
    if (error.code === 'INSUFFICIENT_BALANCE') {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INSUFFICIENT_BALANCE',
          message: error.message,
          available_balance: error.availableBalance,
          required_amount: error.requiredAmount
        }
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
