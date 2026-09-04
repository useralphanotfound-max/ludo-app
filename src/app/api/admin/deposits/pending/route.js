import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Deposit } from '@/lib/models/Deposit';

export async function GET() {
  try {
    await connectDB();

    const pendingDeposits = await Deposit.find({ status: 'PENDING_APPROVAL' })
      .populate('userId', 'username mobile avatarUrl')
      .sort({ updatedAt: -1 })
      .lean();

    const formatted = pendingDeposits.map(d => ({
      id: d._id.toString(),
      deposit_id: d.depositId,
      user_id: d.userId?._id?.toString(),
      username: d.userId?.username || 'Unknown',
      mobile: d.userId?.mobile || '',
      amount: d.amount,
      utr_number: d.utrNumber,
      admin_upi_id: d.adminUpiId,
      status: d.status,
      submitted_at: d.updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: {
        deposits: formatted,
        count: formatted.length
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
