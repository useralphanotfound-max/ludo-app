import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Wallet } from '@/lib/models/Wallet';
import { Transaction } from '@/lib/models/Transaction';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { amountRs, paymentMethod = 'UPI' } = body;

    if (!amountRs || amountRs <= 0) {
      return NextResponse.json({ status: false, message: 'Valid amount required' }, { status: 400 });
    }

    const user = await User.findOne({ role: 'USER' });
    if (!user) return NextResponse.json({ status: false, message: 'User not found' }, { status: 404 });

    const amountPaise = Math.round(amountRs * 100);
    let wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) wallet = await Wallet.create({ userId: user._id });

    wallet.depositBalance += amountPaise;
    await wallet.save();

    const tx = await Transaction.create({
      userId: user._id,
      type: 'DEPOSIT',
      amount: amountPaise,
      subBalanceType: 'deposit',
      status: 'SUCCESS',
      gatewayReferenceId: 'PAY_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      description: `Deposit via ${paymentMethod}`
    });

    return NextResponse.json({
      status: true,
      message: 'Deposit successful',
      data: {
        transactionId: tx._id,
        amountRs,
        updatedDepositBalanceRs: wallet.depositBalance / 100
      }
    });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
