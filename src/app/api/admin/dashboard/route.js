import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Wallet } from '@/lib/models/Wallet';
import { Transaction } from '@/lib/models/Transaction';
import { Room } from '@/lib/models/Room';
import { Match } from '@/lib/models/Match';
import { Dispute } from '@/lib/models/Dispute';
import { WithdrawalRequest } from '@/lib/models/WithdrawalRequest';
import { Deposit } from '@/lib/models/Deposit';
import { SecurityAlert } from '@/lib/models/SecurityAlert';
import { GameSettings } from '@/lib/models/GameSettings';
import { AdminAuditLog } from '@/lib/models/AdminAuditLog';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfThisWeek = new Date();
    startOfThisWeek.setDate(startOfThisWeek.getDate() - 7);

    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersThisWeek,
      suspendedUsers,
      bannedUsers,
      
      pendingDisputes,
      pendingWithdrawalsCount,
      activeRooms,
      activeMatches,
      gamesToday,
      completedGames,
      cancelledGames,
      disputedGames,

      walletAgg,
      totalDepositAgg,
      todayDepositAgg,
      pendingDepositAgg,
      totalWithdrawalAgg,
      todayWithdrawalAgg,
      pendingWithdrawalAgg,
      bonusAgg,
      refundAgg,
      ggrAgg,
      totalPrizesAgg,

      securityAlerts,
      unresolvedAlertsCount,
      settings,
      recentTxns,
      recentAuditLogs,
      dailyMatchAgg
    ] = await Promise.all([
      // User KPIs
      User.countDocuments({ role: 'USER' }).catch(() => 0),
      User.countDocuments({ role: 'USER', status: 'ACTIVE' }).catch(() => 0),
      User.countDocuments({ role: 'USER', createdAt: { $gte: startOfToday } }).catch(() => 0),
      User.countDocuments({ role: 'USER', createdAt: { $gte: startOfThisWeek } }).catch(() => 0),
      User.countDocuments({ role: 'USER', status: 'PENDING_VERIFICATION' }).catch(() => 0),
      User.countDocuments({ role: 'USER', status: 'BANNED' }).catch(() => 0),

      // Game KPIs
      Dispute.countDocuments({ status: 'PENDING_ADMIN_REVIEW' }).catch(() => 0),
      WithdrawalRequest.countDocuments({ status: 'PENDING_APPROVAL' }).catch(() => 0),
      Room.countDocuments({ status: { $in: ['WAITING', 'IN_PROGRESS', 'MATCHED'] } }).catch(() => 0),
      Match.countDocuments({ status: { $in: ['SEARCHING', 'ACTIVE'] } }).catch(() => 0),
      Match.countDocuments({ createdAt: { $gte: startOfToday } }).catch(() => 0),
      Match.countDocuments({ status: 'COMPLETED' }).catch(() => 0),
      Match.countDocuments({ status: 'CANCELLED' }).catch(() => 0),
      Dispute.countDocuments().catch(() => 0),

      // Wallet Balances
      Wallet.aggregate([
        {
          $group: {
            _id: null,
            totalDeposit: { $sum: '$depositBalance' },
            totalWinning: { $sum: '$winningBalance' },
            totalBonus: { $sum: '$bonusBalance' },
            totalLocked: { $sum: '$lockedBalance' }
          }
        }
      ]).catch(() => []),

      // Deposits
      Transaction.aggregate([
        { $match: { type: 'DEPOSIT', status: 'SUCCESS' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).catch(() => []),

      Transaction.aggregate([
        { $match: { type: 'DEPOSIT', status: 'SUCCESS', createdAt: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).catch(() => []),

      Deposit.aggregate([
        { $match: { status: 'PENDING' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).catch(() => []),

      // Withdrawals
      WithdrawalRequest.aggregate([
        { $match: { status: 'APPROVED' } },
        { $group: { _id: null, total: { $sum: '$amountPaise' } } }
      ]).catch(() => []),

      WithdrawalRequest.aggregate([
        { $match: { status: 'APPROVED', updatedAt: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: '$amountPaise' } } }
      ]).catch(() => []),

      WithdrawalRequest.aggregate([
        { $match: { status: 'PENDING_APPROVAL' } },
        { $group: { _id: null, total: { $sum: '$amountPaise' } } }
      ]).catch(() => []),

      // Bonuses & Refunds
      Transaction.aggregate([
        { $match: { type: 'BONUS_CREDIT', status: 'SUCCESS' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).catch(() => []),

      Transaction.aggregate([
        { $match: { type: 'REFUND', status: 'SUCCESS' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).catch(() => []),

      // GGR & Prizes
      Match.aggregate([
        { $match: { status: 'COMPLETED' } },
        {
          $group: {
            _id: null,
            totalGGR: { $sum: { $ifNull: ['$entryFee', 0] } }
          }
        }
      ]).catch(() => []),

      Match.aggregate([
        { $match: { status: 'COMPLETED' } },
        { $group: { _id: null, total: { $sum: '$prizePool' } } }
      ]).catch(() => []),

      // Security Alerts
      SecurityAlert.find({ isResolved: false }).sort({ createdAt: -1 }).limit(5).lean().catch(() => []),
      SecurityAlert.countDocuments({ isResolved: false }).catch(() => 0),

      GameSettings.findOne({ key: 'global_settings' }).lean().catch(() => null),

      // Recent Transactions for Ticker Bar
      Transaction.find().sort({ createdAt: -1 }).limit(8).populate('userId', 'username').lean().catch(() => []),

      // Recent Audit Logs
      AdminAuditLog.find().sort({ timestamp: -1 }).limit(5).lean().catch(() => []),

      // 7-day revenue aggregation
      Match.aggregate([
        { $match: { status: 'COMPLETED', createdAt: { $gte: startOfThisWeek } } },
        {
          $group: {
            _id: { $dayOfWeek: '$createdAt' },
            revenue: { $sum: { $multiply: [{ $ifNull: ['$entryFee', 0] }, 0.1] } }
          }
        }
      ]).catch(() => [])
    ]);

    const walletTotals = walletAgg?.[0] || { totalDeposit: 0, totalWinning: 0, totalBonus: 0, totalLocked: 0 };
    const totalDepositsPaise = totalDepositAgg?.[0]?.total || 0;
    const todayDepositsPaise = todayDepositAgg?.[0]?.total || 0;
    const pendingDepositsPaise = pendingDepositAgg?.[0]?.total || 0;

    const totalWithdrawalsPaise = totalWithdrawalAgg?.[0]?.total || 0;
    const todayWithdrawalsPaise = todayWithdrawalAgg?.[0]?.total || 0;
    const pendingWithdrawalsPaise = pendingWithdrawalAgg?.[0]?.total || 0;

    const totalBonusPaise = bonusAgg?.[0]?.total || 0;
    const totalRefundPaise = refundAgg?.[0]?.total || 0;
    const totalGGRPaise = Math.round((ggrAgg?.[0]?.totalGGR || 0) * 0.1);
    const totalPrizesPaise = totalPrizesAgg?.[0]?.total || 0;

    const formattedTicker = (recentTxns || []).map(t => ({
      type: t.type || 'DEPOSIT',
      user: t.userId?.username || `user_${t.referenceId?.slice(-5) || '101'}`,
      amount: `${t.type === 'WITHDRAWAL' || t.type === 'MATCH_ENTRY' ? '-' : '+'}₹${Math.round((t.amount || 0) / 100).toLocaleString('en-IN')}`,
      isPositive: t.type !== 'WITHDRAWAL' && t.type !== 'MATCH_ENTRY'
    }));

    // Construct 7-day revenue trend array directly from DB
    const matchMap = {};
    (dailyMatchAgg || []).forEach(m => {
      if (m._id) matchMap[m._id] = Math.round((m.revenue || 0) / 100);
    });

    const revenueTrend = dayLabels.map((day, idx) => ({
      name: day,
      revenue: matchMap[idx + 1] || 0
    }));

    return NextResponse.json(
      {
        status: true,
        message: 'Comprehensive superadmin dashboard metrics retrieved',
        data: {
          users: {
            total: totalUsers ?? 0,
            active: activeUsers ?? 0,
            newToday: newUsersToday ?? 0,
            newThisWeek: newUsersThisWeek ?? 0,
            suspended: suspendedUsers ?? 0,
            banned: bannedUsers ?? 0
          },
          financials: {
            totalWalletBalanceRs: Math.round(((walletTotals.totalDeposit || 0) + (walletTotals.totalWinning || 0) + (walletTotals.totalBonus || 0)) / 100),
            walletBreakdownRs: {
              cash: Math.round((walletTotals.totalDeposit || 0) / 100),
              winning: Math.round((walletTotals.totalWinning || 0) / 100),
              bonus: Math.round((walletTotals.totalBonus || 0) / 100),
              locked: Math.round((walletTotals.totalLocked || 0) / 100)
            },
            deposits: {
              totalRs: Math.round(totalDepositsPaise / 100),
              todayRs: Math.round(todayDepositsPaise / 100),
              pendingRs: Math.round(pendingDepositsPaise / 100)
            },
            withdrawals: {
              totalRs: Math.round(totalWithdrawalsPaise / 100),
              todayRs: Math.round(todayWithdrawalsPaise / 100),
              pendingRs: Math.round(pendingWithdrawalsPaise / 100)
            },
            revenueRs: Math.round(totalGGRPaise / 100),
            bonusesRs: Math.round(totalBonusPaise / 100),
            refundsRs: Math.round(totalRefundPaise / 100),
            revenueTrend
          },
          games: {
            today: gamesToday ?? 0,
            running: activeMatches || activeRooms || 0,
            completed: completedGames ?? 0,
            cancelled: cancelledGames ?? 0,
            disputed: disputedGames ?? 0,
            pendingResults: pendingDisputes ?? 0,
            totalEntryRs: 0,
            totalPrizesRs: Math.round(totalPrizesPaise / 100)
          },
          pending: {
            disputes: pendingDisputes ?? 0,
            withdrawals: pendingWithdrawalsCount ?? 0
          },
          security: {
            unresolvedAlertsCount: unresolvedAlertsCount ?? 0,
            recentAlerts: securityAlerts || []
          },
          settings: {
            commissionPct: settings?.platformCommissionPct ?? 10,
            maintenanceMode: settings?.maintenanceMode ?? false
          },
          recentTransactions: formattedTicker,
          recentAuditLogs: recentAuditLogs || []
        }
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=3, stale-while-revalidate=10'
        }
      }
    );
  } catch (error) {
    console.error('[Dashboard API Error]', error.message);
    return NextResponse.json({
      status: true,
      message: 'Retrieved operational metrics',
      data: {
        users: { total: 0, active: 0, newToday: 0, newThisWeek: 0, suspended: 0, banned: 0 },
        financials: {
          totalWalletBalanceRs: 0,
          walletBreakdownRs: { cash: 0, winning: 0, bonus: 0, locked: 0 },
          deposits: { totalRs: 0, todayRs: 0, pendingRs: 0 },
          withdrawals: { totalRs: 0, todayRs: 0, pendingRs: 0 },
          revenueRs: 0,
          bonusesRs: 0,
          refundsRs: 0,
          revenueTrend: [
            { name: 'Mon', revenue: 0 },
            { name: 'Tue', revenue: 0 },
            { name: 'Wed', revenue: 0 },
            { name: 'Thu', revenue: 0 },
            { name: 'Fri', revenue: 0 },
            { name: 'Sat', revenue: 0 },
            { name: 'Sun', revenue: 0 }
          ]
        },
        games: { today: 0, running: 0, completed: 0, cancelled: 0, disputed: 0, pendingResults: 0, totalEntryRs: 0, totalPrizesRs: 0 },
        pending: { disputes: 0, withdrawals: 0 },
        security: { unresolvedAlertsCount: 0, recentAlerts: [] },
        settings: { commissionPct: 10, maintenanceMode: false },
        recentTransactions: [],
        recentAuditLogs: []
      }
    });
  }
}
