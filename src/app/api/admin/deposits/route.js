import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Deposit } from '@/lib/models/Deposit';
import { Transaction } from '@/lib/models/Transaction';
import { User } from '@/lib/models/User';
import { Wallet } from '@/lib/models/Wallet';
import { AdminAuditLog } from '@/lib/models/AdminAuditLog';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    const query = {};
    if (status && status !== 'ALL') query.status = status;
    if (search) {
      query.$or = [
        { depositId: new RegExp(search, 'i') },
        { gatewayReferenceId: new RegExp(search, 'i') }
      ];
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000);

    const [
      deposits,
      totalCount,
      sumAgg,
      pendingCount,
      successfulCount,
      failedCount,
      methodAgg,
      thisPeriodAgg,
      prevPeriodAgg
    ] = await Promise.all([
      Deposit.find(query).populate('userId', 'username mobile avatarUrl').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Deposit.countDocuments(query),
      Deposit.aggregate([
        { $match: { status: { $in: ['APPROVED', 'SUCCESSFUL', 'SUCCESS'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Deposit.countDocuments({ status: { $in: ['PENDING_APPROVAL', 'PENDING', 'INITIATED'] } }),
      Deposit.countDocuments({ status: { $in: ['APPROVED', 'SUCCESSFUL', 'SUCCESS'] } }),
      Deposit.countDocuments({ status: { $in: ['REJECTED', 'EXPIRED', 'FAILED'] } }),
      Deposit.aggregate([
        { $group: { _id: '$paymentMethod', count: { $sum: 1 } } }
      ]),
      Deposit.aggregate([
        { $match: { status: { $in: ['APPROVED', 'SUCCESSFUL', 'SUCCESS'] }, createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Deposit.aggregate([
        { $match: { status: { $in: ['APPROVED', 'SUCCESSFUL', 'SUCCESS'] }, createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const totalDepositsRs = sumAgg[0] ? Math.round(sumAgg[0].total) : 0;
    const thisVol = thisPeriodAgg[0]?.total || 0;
    const prevVol = prevPeriodAgg[0]?.total || 0;
    let growthPctStr = '+0.0% this month';
    if (prevVol > 0) {
      const pct = (((thisVol - prevVol) / prevVol) * 100).toFixed(1);
      growthPctStr = `${Number(pct) >= 0 ? '+' : ''}${pct}% this month`;
    } else if (thisVol > 0) {
      growthPctStr = `+100.0% this month`;
    }

    const methodColors = { UPI: '#10b981', BANK_TRANSFER: '#3b82f6', QR_CODE: '#f59e0b', CARD: '#8b5cf6' };
    const methodDonutData = methodAgg.map(m => ({
      name: m._id || 'UPI',
      value: m.count,
      color: methodColors[m._id] || '#10b981'
    }));

    const formatted = deposits.map(d => ({
      id: d._id,
      depositId: d.depositId,
      user: {
        id: d.userId?._id,
        username: d.userId?.username || 'Unknown',
        mobile: d.userId?.mobile || 'N/A',
        avatarUrl: d.userId?.avatarUrl
      },
      amountRs: Math.round(d.amount || 0),
      utrNumber: d.utrNumber || 'N/A',
      proofImageUrl: d.proofImageUrl || null,
      paymentMethod: d.paymentMethod || 'UPI',
      gatewayProvider: d.gatewayProvider || 'MANUAL_UPI',
      gatewayReferenceId: d.utrNumber || d.depositId || 'N/A',
      status: d.status || 'PENDING_APPROVAL',
      webhookVerified: d.webhookVerified || false,
      failureReason: d.rejectionReason || null,
      createdAt: d.createdAt,
      completedAt: d.approvedAt || d.updatedAt
    }));

    const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000);
    const dailyInflowAgg = await Deposit.aggregate([
      {
        $match: {
          status: { $in: ['APPROVED', 'SUCCESSFUL', 'SUCCESS'] },
          createdAt: { $gte: fourteenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalAmount: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const inflowMap = {};
    dailyInflowAgg.forEach(item => {
      inflowMap[item._id] = Math.round(item.totalAmount);
    });

    const depositTrendData = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      depositTrendData.push({
        name: `Day ${14 - i}`,
        date: dateStr,
        amount: inflowMap[dateStr] || 0
      });
    }

    return NextResponse.json({
      status: true,
      message: 'Deposits retrieved',
      summaryStats: {
        totalDepositsRs,
        pendingCount,
        successfulCount,
        failedCount,
        growthTrend: growthPctStr
      },
      methodDonutData: methodDonutData.length > 0 ? methodDonutData : [
        { name: 'UPI Direct Transfer', value: totalCount || 0, color: '#10b981' }
      ],
      depositTrendData,
      pagination: { total: totalCount, page, limit, totalPages: Math.ceil(totalCount / limit) },
      data: formatted
    });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}

// POST endpoint for manual server-side gateway verification / approval trigger
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { depositId, action, adminUsername, adminId } = body;

    const deposit = await Deposit.findOne({ $or: [{ _id: depositId }, { depositId }] }).populate('userId');
    if (!deposit) {
      return NextResponse.json({ status: false, message: 'Deposit record not found' }, { status: 404 });
    }

    if (action === 'VERIFY_GATEWAY' || action === 'RECONCILE' || action === 'APPROVE') {
      if (deposit.status === 'APPROVED') {
        return NextResponse.json({ status: false, message: 'Deposit already approved and credited.' }, { status: 400 });
      }

      deposit.status = 'APPROVED';
      deposit.approvedAt = new Date();
      await deposit.save();

      // Credit user wallet deposit balance
      const userObjId = deposit.userId?._id || deposit.userId;
      let wallet = await Wallet.findOne({ userId: userObjId });
      if (!wallet) {
        wallet = await Wallet.create({ userId: userObjId, depositBalance: 0, winningBalance: 0, bonusBalance: 0 });
      }
      wallet.depositBalance += deposit.amount;
      await wallet.save();

      // Record transaction
      await Transaction.create({
        userId: userObjId,
        type: 'DEPOSIT',
        amount: deposit.amount,
        subBalanceType: 'deposit',
        status: 'SUCCESS',
        referenceId: deposit.depositId,
        gatewayReferenceId: deposit.utrNumber || `GW-${Date.now()}`,
        description: `Approved UPI Deposit of ₹${Math.round(deposit.amount)} (UTR: ${deposit.utrNumber || 'MANUAL'})`,
        performedBy: adminUsername || 'SUPERADMIN'
      });

      return NextResponse.json({
        status: true,
        message: `Deposit of ₹${Math.round(deposit.amount)} approved and credited to user wallet successfully`
      });
    }

    return NextResponse.json({ status: false, message: 'Action processed' });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
