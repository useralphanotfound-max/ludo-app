import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Transaction } from '@/lib/models/Transaction';

export async function GET(req) {
  try {
    await connectDB();
    const user = await User.findOne({ role: 'USER' });
    if (!user) return NextResponse.json({ status: false, message: 'User not found' }, { status: 404 });

    const transactions = await Transaction.find({ userId: user._id }).sort({ createdAt: -1 }).limit(50);

    const formatted = transactions.map(tx => ({
      id: tx._id,
      type: tx.type,
      amountRs: tx.amount / 100,
      subBalanceType: tx.subBalanceType,
      status: tx.status,
      description: tx.description,
      gatewayReferenceId: tx.gatewayReferenceId,
      createdAt: tx.createdAt
    }));

    return NextResponse.json({
      status: true,
      message: 'Wallet transaction history retrieved',
      data: formatted
    });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
