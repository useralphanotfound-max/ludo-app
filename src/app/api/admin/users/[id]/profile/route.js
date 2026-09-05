import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Wallet } from '@/lib/models/Wallet';
import { Transaction } from '@/lib/models/Transaction';
import { Match } from '@/lib/models/Match';
import { WithdrawalRequest } from '@/lib/models/WithdrawalRequest';
import { LoginHistory } from '@/lib/models/LoginHistory';
import { SecurityAlert } from '@/lib/models/SecurityAlert';

import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

function maskPhoneNumber(phone) {
  if (!phone || phone.length < 6) return phone || 'N/A';
  const clean = phone.trim();
  if (clean.length === 10) return `${clean.slice(0, 2)}****${clean.slice(6)}`;
  return `${clean.slice(0, 4)}****${clean.slice(-2)}`;
}

export async function GET(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await Promise.resolve(params);
    const userId = resolvedParams.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ status: false, message: 'Invalid User ID' }, { status: 400 });
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      return NextResponse.json({ status: false, message: 'User not found' }, { status: 404 });
    }

    const [
      wallet,
      recentTransactions,
      recentMatches,
      recentWithdrawals,
      loginLogs,
      securityAlerts,
      depositAgg,
      withdrawalAgg
    ] = await Promise.all([
      Wallet.findOne({ userId }).lean(),
      Transaction.find({ userId }).sort({ createdAt: -1 }).limit(20).lean(),
      Match.find({ 'players.userId': userId }).sort({ createdAt: -1 }).limit(20).lean(),
      WithdrawalRequest.find({ userId }).sort({ createdAt: -1 }).limit(10).lean(),
      LoginHistory.find({ userId }).sort({ createdAt: -1 }).limit(15).lean(),
      SecurityAlert.find({ userId }).sort({ createdAt: -1 }).limit(10).lean(),
      Transaction.aggregate([
        { $match: { userId: user._id, type: 'DEPOSIT', status: 'SUCCESS' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      WithdrawalRequest.aggregate([
        { $match: { userId: user._id, status: 'APPROVED' } },
        { $group: { _id: null, total: { $sum: '$amountPaise' } } }
      ])
    ]);

    const totalDepositsPaise = depositAgg?.[0]?.total || 0;
    const totalWithdrawalsPaise = withdrawalAgg?.[0]?.total || 0;

    return NextResponse.json({
      status: true,
      message: 'User profile retrieved successfully',
      data: {
        personal: {
          id: user._id,
          username: user.username,
          mobile: user.mobile,
          maskedMobile: maskPhoneNumber(user.mobile),
          avatarUrl: user.avatarUrl,
          status: user.status || 'ACTIVE',
          kycStatus: user.kycStatus || 'VERIFIED',
          riskScore: user.riskScore || 'LOW',
          isWalletFrozen: user.isWalletFrozen || false,
          referralCode: user.referralCode,
          referredBy: user.referredBy,
          registrationDate: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          lastLoginIp: user.lastLoginIp
        },
        financials: {
          wallet: {
            cashRs: Math.round((wallet?.depositBalance || 0) / 100),
            winningRs: Math.round((wallet?.winningBalance || 0) / 100),
            bonusRs: Math.round((wallet?.bonusBalance || 0) / 100),
            lockedRs: Math.round((wallet?.lockedBalance || 0) / 100),
            totalBalanceRs: Math.round(((wallet?.depositBalance || 0) + (wallet?.winningBalance || 0) + (wallet?.bonusBalance || 0)) / 100)
          },
          lifetime: {
            totalDepositsRs: Math.round(totalDepositsPaise / 100),
            totalWithdrawalsRs: Math.round(totalWithdrawalsPaise / 100),
            totalWinningsRs: Math.round((user.stats?.totalWinningsPaise || 0) / 100)
          },
          recentTransactions: recentTransactions.map(t => ({
            id: t._id,
            type: t.type,
            amountRs: Math.round(t.amount / 100),
            subBalanceType: t.subBalanceType,
            status: t.status,
            reason: t.reason || t.description,
            performedBy: t.performedBy,
            createdAt: t.createdAt
          })),
          recentWithdrawals: recentWithdrawals.map(w => ({
            id: w._id,
            amountRs: Math.round(w.amountPaise / 100),
            status: w.status,
            payoutDetails: w.payoutDetails,
            createdAt: w.createdAt
          }))
        },
        gaming: {
          stats: {
            played: user.stats?.played || 0,
            won: user.stats?.won || 0,
            lost: user.stats?.lost || 0,
            winRatePct: user.stats?.played > 0 ? Math.round((user.stats.won / user.stats.played) * 100) : 0
          },
          recentMatches: recentMatches.map(m => {
            const playerInfo = m.players?.find(p => p.userId?.toString() === userId.toString());
            return {
              id: m._id,
              matchId: m.matchId || m._id,
              entryFeeRs: m.entryFee || 0,
              prizePoolRs: m.prizePool || 0,
              status: m.status,
              winnerUserId: m.winnerUserId,
              isWinner: m.winnerUserId?.toString() === userId.toString(),
              color: playerInfo?.color || 'RED',
              createdAt: m.createdAt
            };
          })
        },
        security: {
          deviceId: user.deviceId || 'Unknown',
          deviceType: user.deviceType || 'android',
          appVersion: user.appVersion || '1.0.0',
          loginHistory: loginLogs,
          securityAlerts
        }
      }
    });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
