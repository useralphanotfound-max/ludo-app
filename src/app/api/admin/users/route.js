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

    const [users, totalCount] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(query)
    ]);

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
    wallets.forEach(w => walletMap[w.userId.toString()] = w);

    const depositMap = {};
    depositAggs.forEach(d => depositMap[d._id.toString()] = d.total);

    const withdrawalMap = {};
    withdrawalAggs.forEach(w => withdrawalMap[w._id.toString()] = w.total);

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
