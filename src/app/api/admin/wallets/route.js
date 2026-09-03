import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Wallet } from '@/lib/models/Wallet';
import { Transaction } from '@/lib/models/Transaction';
import { User } from '@/lib/models/User';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000);

    const [
      poolAgg,
      frozenCount,
      txnsLast7Days,
      thisPeriodDeposits,
      prevPeriodDeposits
    ] = await Promise.all([
      Wallet.aggregate([
        {
          $group: {
            _id: null,
            totalCash: { $sum: '$depositBalance' },
            totalWinning: { $sum: '$winningBalance' },
            totalBonus: { $sum: '$bonusBalance' },
            totalLocked: { $sum: '$lockedBalance' }
          }
        }
      ]),
      User.countDocuments({ isWalletFrozen: true }),
      Transaction.find({ createdAt: { $gte: sevenDaysAgo } }).lean(),
      Transaction.aggregate([
        { $match: { type: 'DEPOSIT', createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { type: 'DEPOSIT', createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const pools = poolAgg[0] || {};
    const totalCashRs = Math.round((pools.totalCash || 0) / 100);
    const totalWinningRs = Math.round((pools.totalWinning || 0) / 100);
    const totalBonusRs = Math.round((pools.totalBonus || 0) / 100);
    const totalLockedRs = Math.round((pools.totalLocked || 0) / 100);

    const thisVol = thisPeriodDeposits[0]?.total || 0;
    const prevVol = prevPeriodDeposits[0]?.total || 0;
    let growthPctStr = '+0.0% this week';
    if (prevVol > 0) {
      const pct = (((thisVol - prevVol) / prevVol) * 100).toFixed(1);
      growthPctStr = `${Number(pct) >= 0 ? '+' : ''}${pct}% this week`;
    } else if (thisVol > 0) {
      growthPctStr = `+100.0% this week`;
    }

    // Dynamic 7-day cash flow history
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dayName = days[d.getDay()];
      dayMap[dayName] = { name: dayName, deposits: 0, withdrawals: 0 };
    }

    txnsLast7Days.forEach(t => {
      const dayName = days[new Date(t.createdAt).getDay()];
      if (dayMap[dayName]) {
        const amtRs = Math.round((t.amount || 0) / 100);
        if (t.type === 'DEPOSIT') {
          dayMap[dayName].deposits += amtRs;
        } else if (t.type === 'WITHDRAWAL') {
          dayMap[dayName].withdrawals += amtRs;
        }
      }
    });

    const cashFlowData = Object.values(dayMap);

    return NextResponse.json({
      status: true,
      data: {
        totalCashRs,
        totalWinningRs,
        totalBonusRs,
        totalLockedRs,
        frozenCount,
        growthTrend: growthPctStr,
        cashFlowData
      }
    });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
