import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Transaction } from '@/lib/models/Transaction';
import { User } from '@/lib/models/User';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || 'ALL';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const query = {};
    if (type !== 'ALL') {
      query.type = type;
    }

    if (search) {
      const matchingUsers = await User.find({
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { mobileNumber: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      const userIds = matchingUsers.map(u => u._id);

      query.$or = [
        { referenceId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { userId: { $in: userIds } }
      ];
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'username mobileNumber')
      .lean();

    const formatted = transactions.map(t => ({
      id: t._id.toString(),
      txnId: t.referenceId || `TXN-${t._id.toString().slice(-6).toUpperCase()}`,
      username: t.userId?.username || 'kingplayer',
      type: t.type,
      amountRs: Math.round((t.amount || 0) / 100),
      prevBalanceRs: Math.round((t.previousBalance || 0) / 100),
      newBalanceRs: Math.round((t.newBalance || 0) / 100),
      status: t.status || 'SUCCESS',
      reason: t.reason || t.description || 'System Financial Ledger',
      createdAt: t.createdAt
    }));

    return NextResponse.json({
      status: true,
      data: formatted,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
