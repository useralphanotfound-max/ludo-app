import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { WithdrawalRequest } from '@/lib/models/WithdrawalRequest';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const query = {};
    if (status) query.status = status;

    const withdrawals = await WithdrawalRequest.find(query).sort({ createdAt: -1 });

    const data = withdrawals.map(w => ({
      id: w._id,
      userId: w.userId,
      username: w.username,
      mobile: w.mobile,
      amountRs: w.amountPaise / 100,
      payoutMethod: w.payoutMethod,
      accountDetails: w.accountDetails,
      status: w.status,
      riskScore: w.riskScore,
      rejectionReason: w.rejectionReason,
      createdAt: w.createdAt
    }));

    return NextResponse.json({ status: true, message: 'Withdrawals retrieved', data });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
