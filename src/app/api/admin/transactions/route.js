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

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000);

    const [
      total,
      transactions,
      volumeAgg,
      typeAgg,
      thisPeriodAgg,
      prevPeriodAgg
    ] = await Promise.all([
      Transaction.countDocuments(query),
      Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'username mobileNumber')
        .lean(),
      Transaction.aggregate([
        {
          $group: {
            _id: null,
            totalVolume: { $sum: '$amount' },
            depositTotal: { $sum: { $cond: [{ $eq: ['$type', 'DEPOSIT'] }, '$amount', 0] } },
            withdrawalTotal: { $sum: { $cond: [{ $eq: ['$type', 'WITHDRAWAL'] }, '$amount', 0] } },
            depositCount: { $sum: { $cond: [{ $eq: ['$type', 'DEPOSIT'] }, 1, 0] } },
            withdrawalCount: { $sum: { $cond: [{ $eq: ['$type', 'WITHDRAWAL'] }, 1, 0] } }
          }
        }
      ]),
      Transaction.aggregate([
        { $group: { _id: '$type', amount: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const volData = volumeAgg[0] || {};
    const totalVolumeRs = Math.round((volData.totalVolume || 0) / 100);
    const totalDepositsRs = Math.round((volData.depositTotal || 0) / 100);
    const totalWithdrawalsRs = Math.round((volData.withdrawalTotal || 0) / 100);
    const netFlowRs = totalDepositsRs - totalWithdrawalsRs;
    const depositCount = volData.depositCount || 0;
    const withdrawalCount = volData.withdrawalCount || 0;

    const thisVol = thisPeriodAgg[0]?.total || 0;
    const prevVol = prevPeriodAgg[0]?.total || 0;
    let growthPctStr = '+0.0% this month';
    if (prevVol > 0) {
      const pct = (((thisVol - prevVol) / prevVol) * 100).toFixed(1);
      growthPctStr = `${Number(pct) >= 0 ? '+' : ''}${pct}% this month`;
    } else if (thisVol > 0) {
      growthPctStr = `+100.0% this month`;
    }

    const typeBreakdownData = typeAgg.map(t => ({
      name: t._id || 'OTHER',
      amount: Math.round((t.amount || 0) / 100)
    }));

    const formatted = transactions.map(t => {
      const idStr = t._id ? t._id.toString() : 'TXN';
      return {
        id: idStr,
        txnId: t.referenceId || `TXN-${idStr.slice(-6).toUpperCase()}`,
        username: t.userId?.username || 'kingplayer',
        type: t.type,
        amountRs: Math.round((t.amount || 0) / 100),
        prevBalanceRs: Math.round((t.previousBalance || 0) / 100),
        newBalanceRs: Math.round((t.newBalance || 0) / 100),
        status: t.status || 'SUCCESS',
        reason: t.reason || t.description || 'System Financial Ledger',
        createdAt: t.createdAt
      };
    });

    return NextResponse.json({
      status: true,
      data: formatted,
      summaryStats: {
        totalVolumeRs,
        totalDepositsRs,
        totalWithdrawalsRs,
        netFlowRs,
        depositCount,
        withdrawalCount,
        growthTrend: growthPctStr
      },
      typeBreakdownData: typeBreakdownData.length > 0 ? typeBreakdownData : [
        { name: 'DEPOSIT', amount: totalDepositsRs },
        { name: 'WITHDRAWAL', amount: totalWithdrawalsRs }
      ],
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
