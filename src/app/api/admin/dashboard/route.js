import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Wallet } from '@/lib/models/Wallet';
import { Transaction } from '@/lib/models/Transaction';
import { Room } from '@/lib/models/Room';
import { Match } from '@/lib/models/Match';
import { Dispute } from '@/lib/models/Dispute';
import { WithdrawalRequest } from '@/lib/models/WithdrawalRequest';
import { GameSettings } from '@/lib/models/GameSettings';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();

    const [
      totalUsers,
      activeUsers,
      bannedUsers,
      pendingDisputes,
      pendingWithdrawalsCount,
      activeRooms,
      activeMatches,
      walletAgg,
      depositAgg,
      withdrawalAgg,
      pendingWithdrawalAgg,
      ggrAgg,
      settings
    ] = await Promise.all([
      User.countDocuments({ role: 'USER' }),
      User.countDocuments({ role: 'USER', status: 'ACTIVE' }),
      User.countDocuments({ status: 'BANNED' }),
      Dispute.countDocuments({ status: 'PENDING_ADMIN_REVIEW' }),
      WithdrawalRequest.countDocuments({ status: 'PENDING_APPROVAL' }),
      Room.countDocuments({ status: { $in: ['WAITING', 'IN_PROGRESS', 'MATCHED'] } }),
      Match.countDocuments({ status: { $in: ['SEARCHING', 'ACTIVE'] } }),
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
      ]),
      Transaction.aggregate([
        { $match: { type: 'DEPOSIT', status: 'SUCCESS' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      WithdrawalRequest.aggregate([
        { $match: { status: 'APPROVED' } },
        { $group: { _id: null, total: { $sum: '$amountPaise' } } }
      ]),
      WithdrawalRequest.aggregate([
        { $match: { status: 'PENDING_APPROVAL' } },
        { $group: { _id: null, total: { $sum: '$amountPaise' } } }
      ]),
      Match.aggregate([
        { $match: { status: 'COMPLETED' } },
        {
          $group: {
            _id: null,
            totalGGR: {
              $sum: {
                $multiply: [
                  { $ifNull: ['$entryFee', 0] },
                  { $size: { $ifNull: ['$players', []] } },
                  0.1
                ]
              }
            }
          }
        }
      ]),
      GameSettings.findOne({ key: 'global_settings' }).lean()
    ]);

    const walletTotals = walletAgg?.[0] || { totalDeposit: 0, totalWinning: 0, totalBonus: 0, totalLocked: 0 };
    const totalDepositsPaise = depositAgg?.[0]?.total || 0;
    const totalWithdrawalsPaise = withdrawalAgg?.[0]?.total || 0;
    const pendingWithdrawalsPaise = pendingWithdrawalAgg?.[0]?.total || 0;
    const totalGGRPaise = Math.round(ggrAgg?.[0]?.totalGGR || 0);

    return NextResponse.json({
      status: true,
      message: 'Dashboard metrics retrieved',
      data: {
        users: { total: totalUsers || 0, active: activeUsers || 0, banned: bannedUsers || 0 },
        pending: { disputes: pendingDisputes || 0, withdrawals: pendingWithdrawalsCount || 0 },
        live: { rooms: activeRooms || 0, matches: activeMatches || 0 },
        financials: {
          totalDepositsRs: Math.round(totalDepositsPaise / 100),
          totalWithdrawalsRs: Math.round(totalWithdrawalsPaise / 100),
          pendingWithdrawalsRs: Math.round(pendingWithdrawalsPaise / 100),
          ggrRs: Math.round(totalGGRPaise / 100),
          walletBalancesRs: {
            deposit: Math.round((walletTotals.totalDeposit || 0) / 100),
            winning: Math.round((walletTotals.totalWinning || 0) / 100),
            bonus: Math.round((walletTotals.totalBonus || 0) / 100),
            locked: Math.round((walletTotals.totalLocked || 0) / 100)
          }
        },
        settings: {
          commissionPct: settings?.platformCommissionPct ?? 10,
          maintenanceMode: settings?.maintenanceMode ?? false
        }
      }
    });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
