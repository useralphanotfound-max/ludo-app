import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { WithdrawalRequest } from '@/lib/models/WithdrawalRequest';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const query = {};
    if (status) query.status = status;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000);

    const [
      withdrawals,
      pendingCount,
      approvedTodayAgg,
      rejectedCount,
      processedRequests,
      thisPeriodCount,
      prevPeriodCount,
      last7DaysWithdrawals
    ] = await Promise.all([
      WithdrawalRequest.find(query).sort({ createdAt: -1 }).lean(),
      WithdrawalRequest.countDocuments({ status: 'PENDING' }),
      WithdrawalRequest.aggregate([
        { $match: { status: 'APPROVED', createdAt: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: '$amountPaise' } } }
      ]),
      WithdrawalRequest.countDocuments({ status: 'REJECTED' }),
      WithdrawalRequest.find({ status: { $in: ['APPROVED', 'REJECTED'] } }).select('createdAt updatedAt').lean(),
      WithdrawalRequest.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      WithdrawalRequest.countDocuments({ createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } }),
      WithdrawalRequest.find({ createdAt: { $gte: sevenDaysAgo } }).lean()
    ]);

    // Dynamic processing time
    let totalMins = 0;
    let processedCount = 0;
    processedRequests.forEach(r => {
      if (r.createdAt && r.updatedAt) {
        const diff = (new Date(r.updatedAt).getTime() - new Date(r.createdAt).getTime()) / 60000;
        if (diff > 0 && diff < 1440) { // filter reasonable window
          totalMins += diff;
          processedCount++;
        }
      }
    });
    const avgMins = processedCount > 0 ? (totalMins / processedCount).toFixed(1) : '3.5';

    // Dynamic growth trend
    let growthPctStr = '+0.0% this week';
    if (prevPeriodCount > 0) {
      const pct = (((thisPeriodCount - prevPeriodCount) / prevPeriodCount) * 100).toFixed(1);
      growthPctStr = `${Number(pct) >= 0 ? '+' : ''}${pct}% this week`;
    } else if (thisPeriodCount > 0) {
      growthPctStr = `+${thisPeriodCount * 100}.0% this week`;
    }

    // Dynamic 7-day approved vs rejected velocity breakdown
    const dayMap = {};
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dayName = days[d.getDay()];
      dayMap[dayName] = { name: dayName, approved: 0, rejected: 0 };
    }

    last7DaysWithdrawals.forEach(w => {
      const dayName = days[new Date(w.createdAt).getDay()];
      if (dayMap[dayName]) {
        if (w.status === 'APPROVED') dayMap[dayName].approved++;
        else if (w.status === 'REJECTED') dayMap[dayName].rejected++;
      }
    });

    const velocityTrendData = Object.values(dayMap);

    const approvedTodayRs = approvedTodayAgg[0] ? Math.round(approvedTodayAgg[0].total / 100) : 0;

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

    return NextResponse.json({
      status: true,
      message: 'Withdrawals retrieved',
      summaryStats: {
        pendingCount,
        approvedTodayRs,
        rejectedCount,
        avgProcessingTime: `${avgMins} mins`,
        growthTrend: growthPctStr
      },
      velocityTrendData,
      data
    });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
