import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Wallet } from '@/lib/models/Wallet';
import { Transaction } from '@/lib/models/Transaction';
import { WithdrawalRequest } from '@/lib/models/WithdrawalRequest';

export const dynamic = 'force-dynamic';

function maskPhoneNumber(phone) {
  if (!phone || phone.length < 6) return phone || 'N/A';
  const clean = phone.trim();
  if (clean.length === 10) {
    return `${clean.slice(0, 2)}****${clean.slice(6)}`;
  }
  if (clean.length > 10) {
    return `${clean.slice(0, 5)}****${clean.slice(-2)}`;
  }
  return `${clean.slice(0, 2)}***${clean.slice(-2)}`;
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const kycStatus = searchParams.get('kycStatus');
    const riskScore = searchParams.get('riskScore');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    const query = { role: 'USER' };
    if (status) query.status = status;
    if (kycStatus) query.kycStatus = kycStatus;
    if (riskScore) query.riskScore = riskScore;
    if (search) {
      query.$or = [
        { username: new RegExp(search, 'i') },
        { mobile: new RegExp(search, 'i') },
        { referralCode: new RegExp(search, 'i') }
      ];
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000);
    const twentyOneDaysAgo = new Date(now.getTime() - 21 * 86400000);
    const twentyEightDaysAgo = new Date(now.getTime() - 28 * 86400000);

    const [
      users,
      totalCount,
      allDbUsersCount,
      activeCount,
      kycPendingCount,
      highRiskCount,
      thisPeriodCount,
      prevPeriodCount,
      w1Count,
      w2Count,
      w3Count,
      w4Count
    ] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(query),
      User.countDocuments({ role: 'USER' }),
      User.countDocuments({ role: 'USER', status: 'ACTIVE' }),
      User.countDocuments({ role: 'USER', kycStatus: { $ne: 'VERIFIED' } }),
      User.countDocuments({ role: 'USER', riskScore: 'HIGH' }),
      User.countDocuments({ role: 'USER', createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ role: 'USER', createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
      User.countDocuments({ role: 'USER', createdAt: { $gte: twentyEightDaysAgo, $lt: twentyOneDaysAgo } }),
      User.countDocuments({ role: 'USER', createdAt: { $gte: twentyOneDaysAgo, $lt: fourteenDaysAgo } }),
      User.countDocuments({ role: 'USER', createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } }),
      User.countDocuments({ role: 'USER', createdAt: { $gte: sevenDaysAgo } })
    ]);

    let growthPctStr = '+0.0% this month';
    if (prevPeriodCount > 0) {
      const pct = (((thisPeriodCount - prevPeriodCount) / prevPeriodCount) * 100).toFixed(1);
      growthPctStr = `${Number(pct) >= 0 ? '+' : ''}${pct}% this month`;
    } else if (thisPeriodCount > 0) {
      growthPctStr = `+${thisPeriodCount * 100}.0% this month`;
    }

    const userIds = users.map(u => u._id);

    const [wallets, depositAggs, withdrawalAggs] = await Promise.all([
      Wallet.find({ userId: { $in: userIds } }).lean(),
      Transaction.aggregate([
        { $match: { userId: { $in: userIds }, type: 'DEPOSIT', status: 'SUCCESS' } },
        { $group: { _id: '$userId', total: { $sum: '$amount' } } }
      ]),
      WithdrawalRequest.aggregate([
        { $match: { userId: { $in: userIds }, status: 'APPROVED' } },
        { $group: { _id: '$userId', total: { $sum: '$amountPaise' } } }
      ])
    ]);

    const walletMap = {};
    wallets.forEach(w => {
      if (w?.userId) {
        walletMap[w.userId.toString()] = w;
      }
    });

    const depositMap = {};
    depositAggs.forEach(d => {
      if (d?._id) {
        depositMap[d._id.toString()] = d.total;
      }
    });

    const withdrawalMap = {};
    withdrawalAggs.forEach(w => {
      if (w?._id) {
        withdrawalMap[w._id.toString()] = w.total;
      }
    });

    const data = users.map(u => {
      const w = walletMap[u._id.toString()] || {};
      const totalDepositsPaise = depositMap[u._id.toString()] || 0;
      const totalWithdrawalsPaise = withdrawalMap[u._id.toString()] || 0;

      return {
        id: u._id,
        username: u.username,
        mobile: u.mobile,
        maskedMobile: maskPhoneNumber(u.mobile),
        status: u.status || 'ACTIVE',
        kycStatus: u.kycStatus || 'VERIFIED',
        riskScore: u.riskScore || 'LOW',
        isWalletFrozen: u.isWalletFrozen || false,
        avatarUrl: u.avatarUrl,
        referralCode: u.referralCode,
        referredBy: u.referredBy,
        deviceId: u.deviceId || 'Unknown',
        lastLoginAt: u.lastLoginAt,
        lastLoginIp: u.lastLoginIp || '127.0.0.1',
        createdAt: u.createdAt,
        stats: {
          played: u.stats?.played || 0,
          won: u.stats?.won || 0,
          lost: u.stats?.lost || 0,
          totalWinningsRs: Math.round((u.stats?.totalWinningsPaise || 0) / 100)
        },
        financials: {
          totalDepositsRs: Math.round(totalDepositsPaise / 100),
          totalWithdrawalsRs: Math.round(totalWithdrawalsPaise / 100)
        },
        wallet: {
          depositBalanceRs: Math.round((w.depositBalance || 0) / 100),
          winningBalanceRs: Math.round((w.winningBalance || 0) / 100),
          bonusBalanceRs: Math.round((w.bonusBalance || 0) / 100),
          lockedBalanceRs: Math.round((w.lockedBalance || 0) / 100),
          totalBalanceRs: Math.round(((w.depositBalance || 0) + (w.winningBalance || 0) + (w.bonusBalance || 0)) / 100)
        }
      };
    });

    return NextResponse.json({
      status: true,
      message: 'Users retrieved',
      summaryStats: {
        totalUsers: allDbUsersCount,
        activeCount,
        kycPendingCount,
        highRiskCount,
        growthTrend: growthPctStr,
        regTrendData: [
          { name: 'W1', count: w1Count },
          { name: 'W2', count: w2Count },
          { name: 'W3', count: w3Count },
          { name: 'W4', count: w4Count }
        ]
      },
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      },
      data
    });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
