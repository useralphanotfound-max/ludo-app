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

    const totalUsers = await User.countDocuments({ role: 'USER' });
    const activeUsers = await User.countDocuments({ role: 'USER', status: 'ACTIVE' });
    const bannedUsers = await User.countDocuments({ status: 'BANNED' });

    const pendingDisputes = await Dispute.countDocuments({ status: 'PENDING_ADMIN_REVIEW' });
    const pendingWithdrawalsCount = await WithdrawalRequest.countDocuments({ status: 'PENDING_APPROVAL' });

    const activeRooms = await Room.countDocuments({ status: { $in: ['WAITING', 'IN_PROGRESS', 'MATCHED'] } });
    const activeMatches = await Match.countDocuments({ status: { $in: ['SEARCHING', 'ACTIVE'] } });

    const walletAgg = await Wallet.aggregate([
      {
        $group: {
          _id: null,
          totalDeposit: { $sum: '$depositBalance' },
          totalWinning: { $sum: '$winningBalance' },
          totalBonus: { $sum: '$bonusBalance' },
          totalLocked: { $sum: '$lockedBalance' }
        }
      }
    ]);

    const walletTotals = walletAgg[0] || { totalDeposit: 0, totalWinning: 0, totalBonus: 0, totalLocked: 0 };

    const depositAgg = await Transaction.aggregate([
      { $match: { type: 'DEPOSIT', status: 'SUCCESS' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalDepositsPaise = depositAgg[0]?.total || 0;

    const withdrawalAgg = await WithdrawalRequest.aggregate([
      { $match: { status: 'APPROVED' } },
      { $group: { _id: null, total: { $sum: '$amountPaise' } } }
    ]);
    const totalWithdrawalsPaise = withdrawalAgg[0]?.total || 0;

    const pendingWithdrawalAgg = await WithdrawalRequest.aggregate([
      { $match: { status: 'PENDING_APPROVAL' } },
      { $group: { _id: null, total: { $sum: '$amountPaise' } } }
    ]);
    const pendingWithdrawalsPaise = pendingWithdrawalAgg[0]?.total || 0;

    const completedMatches = await Match.find({ status: 'COMPLETED' });
    let totalGGRPaise = 0;
    completedMatches.forEach(m => {
      totalGGRPaise += Math.round(m.entryFee * m.players.length * 0.1);
    });

    const settings = await GameSettings.findOne({ key: 'global_settings' }) || {};

    return NextResponse.json({
      status: true,
      message: 'Dashboard metrics retrieved',
      data: {
        users: { total: totalUsers, active: activeUsers, banned: bannedUsers },
        pending: { disputes: pendingDisputes, withdrawals: pendingWithdrawalsCount },
        live: { rooms: activeRooms, matches: activeMatches },
        financials: {
          totalDepositsRs: Math.round(totalDepositsPaise / 100),
          totalWithdrawalsRs: Math.round(totalWithdrawalsPaise / 100),
          pendingWithdrawalsRs: Math.round(pendingWithdrawalsPaise / 100),
          ggrRs: Math.round(totalGGRPaise / 100),
          walletBalancesRs: {
            deposit: Math.round(walletTotals.totalDeposit / 100),
            winning: Math.round(walletTotals.totalWinning / 100),
            bonus: Math.round(walletTotals.totalBonus / 100),
            locked: Math.round(walletTotals.totalLocked / 100)
          }
        },
        settings: {
          commissionPct: settings.platformCommissionPct || 10,
          maintenanceMode: settings.maintenanceMode || false
        }
      }
    });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
