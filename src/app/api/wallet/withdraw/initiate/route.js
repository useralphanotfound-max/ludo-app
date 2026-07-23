import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Wallet } from '@/lib/models/Wallet';
import { WithdrawalRequest } from '@/lib/models/WithdrawalRequest';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { amountRs, payoutMethod = 'UPI', upiId, accountNumber, ifscCode, accountHolderName } = body;

    if (!amountRs || amountRs <= 0) {
      return NextResponse.json({ status: false, message: 'Valid amount required' }, { status: 400 });
    }

    const user = await User.findOne({ role: 'USER' });
    if (!user) return NextResponse.json({ status: false, message: 'User not found' }, { status: 404 });

    const amountPaise = Math.round(amountRs * 100);
    const wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) return NextResponse.json({ status: false, message: 'Wallet not found' }, { status: 404 });

    const availableWithdrawable = wallet.depositBalance + wallet.winningBalance;
    if (amountPaise > availableWithdrawable) {
      return NextResponse.json({ status: false, message: 'Insufficient withdrawable balance' }, { status: 400 });
    }

    if (wallet.winningBalance >= amountPaise) {
      wallet.winningBalance -= amountPaise;
    } else {
      const remainder = amountPaise - wallet.winningBalance;
      wallet.winningBalance = 0;
      wallet.depositBalance -= remainder;
    }
    wallet.lockedBalance += amountPaise;
    await wallet.save();

    const withdrawal = await WithdrawalRequest.create({
      userId: user._id,
      username: user.username,
      mobile: user.mobile,
      amountPaise,
      payoutMethod,
      accountDetails: { upiId, accountNumber, ifscCode, accountHolderName },
      status: 'PENDING_APPROVAL'
    });

    return NextResponse.json({
      status: true,
      message: 'Withdrawal request submitted for processing',
      data: {
        withdrawalId: withdrawal._id,
        amountRs,
        status: withdrawal.status
      }
    });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
