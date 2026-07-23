import { User } from '../models/User.js';
import { Wallet } from '../models/Wallet.js';
import { Transaction } from '../models/Transaction.js';
import { Room } from '../models/Room.js';
import { Match } from '../models/Match.js';
import { Dispute } from '../models/Dispute.js';
import { WithdrawalRequest } from '../models/WithdrawalRequest.js';
import { GameSettings } from '../models/GameSettings.js';
import { AdminAuditLog } from '../models/AdminAuditLog.js';
import { getClientIp } from '../utils/ipHelper.js';

// GET /api/admin/dashboard
export const getDashboardMetrics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'USER' });
    const activeUsers = await User.countDocuments({ role: 'USER', status: 'ACTIVE' });
    const bannedUsers = await User.countDocuments({ status: 'BANNED' });

    const pendingDisputes = await Dispute.countDocuments({ status: 'PENDING_ADMIN_REVIEW' });
    const pendingWithdrawalsCount = await WithdrawalRequest.countDocuments({ status: 'PENDING_APPROVAL' });

    const activeRooms = await Room.countDocuments({ status: { $in: ['WAITING', 'IN_PROGRESS', 'MATCHED'] } });
    const activeMatches = await Match.countDocuments({ status: { $in: ['SEARCHING', 'ACTIVE'] } });

    // Aggregate Wallet Totals across system
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

    // Financial Metrics (Deposits, Withdrawals, Platform Revenue)
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

    // Gross Gaming Revenue (GGR) estimate = 10% platform commission on completed matches
    const completedMatches = await Match.find({ status: 'COMPLETED' });
    let totalGGRPaise = 0;
    completedMatches.forEach(m => {
      totalGGRPaise += Math.round(m.entryFee * m.players.length * 0.1);
    });

    const settings = await GameSettings.findOne({ key: 'global_settings' }) || {};

    return res.json({
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
    console.error('[Admin Dashboard Error]', error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

// GET /api/admin/users
export const getUsers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    const query = { role: 'USER' };

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { username: new RegExp(search, 'i') },
        { mobile: new RegExp(search, 'i') },
        { referralCode: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    // Fetch wallets for users
    const userIds = users.map(u => u._id);
    const wallets = await Wallet.find({ userId: { $in: userIds } });
    const walletMap = {};
    wallets.forEach(w => walletMap[w.userId.toString()] = w);

    const data = users.map(u => {
      const w = walletMap[u._id.toString()] || {};
      return {
        id: u._id,
        username: u.username,
        mobile: u.mobile,
        status: u.status,
        avatarUrl: u.avatarUrl,
        referralCode: u.referralCode,
        referredBy: u.referredBy,
        deviceId: u.deviceId,
        lastLoginAt: u.lastLoginAt,
        lastLoginIp: u.lastLoginIp,
        createdAt: u.createdAt,
        stats: u.stats,
        wallet: {
          depositBalanceRs: (w.depositBalance || 0) / 100,
          winningBalanceRs: (w.winningBalance || 0) / 100,
          bonusBalanceRs: (w.bonusBalance || 0) / 100,
          lockedBalanceRs: (w.lockedBalance || 0) / 100,
          totalBalanceRs: ((w.depositBalance || 0) + (w.winningBalance || 0) + (w.bonusBalance || 0)) / 100
        }
      };
    });

    return res.json({ status: true, message: 'Users retrieved', data, meta: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// POST /api/admin/users/:id/wallet-adjust (Manual wallet credit/debit with exact IP logging)
export const adjustUserWallet = async (req, res) => {
  try {
    const { id } = req.params;
    const { amountRs, subBalanceType, actionType, reason } = req.body; // subBalanceType: deposit|winning|bonus, actionType: CREDIT|DEBIT
    const clientIp = getClientIp(req);

    if (!amountRs || amountRs <= 0 || !reason) {
      return res.status(400).json({ status: false, message: 'Valid amount (in ₹) and mandatory reason note are required' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ status: false, message: 'User not found' });

    let wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) {
      wallet = await Wallet.create({ userId: user._id });
    }

    const amountPaise = Math.round(amountRs * 100);
    const delta = actionType === 'DEBIT' ? -amountPaise : amountPaise;

    const targetField = `${subBalanceType || 'deposit'}Balance`;
    const previousBalance = wallet[targetField] || 0;
    const newBalance = previousBalance + delta;

    if (newBalance < 0) {
      return res.status(400).json({ status: false, message: `Insufficient ${subBalanceType} balance for debit action` });
    }

    wallet[targetField] = newBalance;
    await wallet.save();

    // Log append-only transaction entry
    await Transaction.create({
      userId: user._id,
      type: 'MANUAL_ADJUSTMENT',
      amount: delta,
      subBalanceType: subBalanceType || 'deposit',
      status: 'SUCCESS',
      description: `Admin manual ${actionType}: ₹${amountRs} (${reason})`,
      performedBy: req.user ? req.user.username : 'superadmin'
    });

    // Log to Admin Audit Log with IP
    await AdminAuditLog.create({
      adminId: req.user ? req.user.id : null,
      adminUsername: req.user ? req.user.username : 'superadmin',
      action: 'WALLET_MANUAL_ADJUSTMENT',
      targetEntity: `User:${user.username}`,
      targetId: user._id.toString(),
      details: `${actionType} ₹${amountRs} (${subBalanceType}). Reason: ${reason}`,
      diff: { subBalanceType, previousRs: previousBalance / 100, newRs: newBalance / 100 },
      ipAddress: clientIp,
      userAgent: req.headers['user-agent'] || 'Unknown'
    });

    return res.json({
      status: true,
      message: `Successfully ${actionType.toLowerCase()}ed ₹${amountRs} on user ${user.username}`,
      data: {
        userId: user._id,
        username: user.username,
        updatedWallet: {
          depositBalanceRs: wallet.depositBalance / 100,
          winningBalanceRs: wallet.winningBalance / 100,
          bonusBalanceRs: wallet.bonusBalance / 100,
          totalBalanceRs: (wallet.depositBalance + wallet.winningBalance + wallet.bonusBalance) / 100
        }
      }
    });
  } catch (error) {
    console.error('[Wallet Adjust Error]', error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

// PATCH /api/admin/users/:id/status (Ban/Unban user with IP logging)
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const clientIp = getClientIp(req);

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ status: false, message: 'User not found' });

    const prevStatus = user.status;
    user.status = status;
    await user.save();

    const actionName = status === 'BANNED' ? 'BAN_USER' : 'UNBAN_USER';

    await AdminAuditLog.create({
      adminId: req.user ? req.user.id : null,
      adminUsername: req.user ? req.user.username : 'superadmin',
      action: actionName,
      targetEntity: `User:${user.username}`,
      targetId: user._id.toString(),
      details: `User status changed from ${prevStatus} to ${status}. Reason: ${reason || 'N/A'}`,
      ipAddress: clientIp,
      userAgent: req.headers['user-agent'] || 'Unknown'
    });

    return res.json({ status: true, message: `User status updated to ${status}` });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// GET /api/admin/withdrawals
export const getWithdrawals = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const withdrawals = await WithdrawalRequest.find(query).sort({ createdAt: -1 });

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

    return res.json({ status: true, message: 'Withdrawals retrieved', data });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// POST /api/admin/withdrawals/:id/process (Approve or Reject cashout with IP logging, 100% net amount)
export const processWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body; // action: APPROVE | REJECT
    const clientIp = getClientIp(req);

    const withdrawal = await WithdrawalRequest.findById(id);
    if (!withdrawal) return res.status(404).json({ status: false, message: 'Withdrawal request not found' });

    if (withdrawal.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({ status: false, message: `Request is already ${withdrawal.status}` });
    }

    const wallet = await Wallet.findOne({ userId: withdrawal.userId });

    if (action === 'APPROVE') {
      withdrawal.status = 'APPROVED';
      withdrawal.processedBy = req.user ? req.user.username : 'superadmin';
      withdrawal.processedAt = new Date();
      await withdrawal.save();

      // Deduct from locked balance permanently
      if (wallet) {
        wallet.lockedBalance = Math.max(0, wallet.lockedBalance - withdrawal.amountPaise);
        await wallet.save();
      }

      await Transaction.create({
        userId: withdrawal.userId,
        type: 'WITHDRAWAL',
        amount: -withdrawal.amountPaise,
        status: 'SUCCESS',
        description: `Withdrawal approved (Payout ₹${withdrawal.amountPaise / 100} via ${withdrawal.payoutMethod})`,
        performedBy: req.user ? req.user.username : 'superadmin'
      });

      await AdminAuditLog.create({
        adminId: req.user ? req.user.id : null,
        adminUsername: req.user ? req.user.username : 'superadmin',
        action: 'APPROVE_WITHDRAWAL',
        targetEntity: `Withdrawal:${withdrawal._id}`,
        targetId: withdrawal._id.toString(),
        details: `Approved payout of ₹${withdrawal.amountPaise / 100} for ${withdrawal.username}`,
        ipAddress: clientIp,
        userAgent: req.headers['user-agent'] || 'Unknown'
      });

      return res.json({ status: true, message: `Withdrawal ₹${withdrawal.amountPaise / 100} approved successfully` });
    } else {
      withdrawal.status = 'REJECTED';
      withdrawal.rejectionReason = reason || 'Rejected by superadmin';
      withdrawal.processedBy = req.user ? req.user.username : 'superadmin';
      withdrawal.processedAt = new Date();
      await withdrawal.save();

      // Refund locked balance back to winning/deposit balance
      if (wallet) {
        wallet.lockedBalance = Math.max(0, wallet.lockedBalance - withdrawal.amountPaise);
        wallet.winningBalance += withdrawal.amountPaise; // Refund to winning balance
        await wallet.save();
      }

      await Transaction.create({
        userId: withdrawal.userId,
        type: 'REFUND',
        amount: withdrawal.amountPaise,
        status: 'SUCCESS',
        description: `Withdrawal rejected & refunded: ₹${withdrawal.amountPaise / 100} (${reason || 'Admin reject'})`,
        performedBy: req.user ? req.user.username : 'superadmin'
      });

      await AdminAuditLog.create({
        adminId: req.user ? req.user.id : null,
        adminUsername: req.user ? req.user.username : 'superadmin',
        action: 'REJECT_WITHDRAWAL',
        targetEntity: `Withdrawal:${withdrawal._id}`,
        targetId: withdrawal._id.toString(),
        details: `Rejected payout of ₹${withdrawal.amountPaise / 100} for ${withdrawal.username}. Reason: ${reason || 'N/A'}`,
        ipAddress: clientIp,
        userAgent: req.headers['user-agent'] || 'Unknown'
      });

      return res.json({ status: true, message: `Withdrawal rejected and ₹${withdrawal.amountPaise / 100} refunded to user winning wallet` });
    }
  } catch (error) {
    console.error('[Process Withdrawal Error]', error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

// GET /api/admin/disputes
export const getDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find().sort({ createdAt: -1 });
    return res.json({ status: true, message: 'Disputes retrieved', data: disputes });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// POST /api/admin/disputes/:id/resolve (Resolve match screenshot dispute with IP logging)
export const resolveDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, adminNotes } = req.body; // decision: P1_WIN | P2_WIN | REFUND_BOTH
    const clientIp = getClientIp(req);

    const dispute = await Dispute.findById(id).populate('matchId');
    if (!dispute) return res.status(404).json({ status: false, message: 'Dispute record not found' });

    if (dispute.status !== 'PENDING_ADMIN_REVIEW') {
      return res.status(400).json({ status: false, message: 'Dispute is already resolved' });
    }

    const match = await Match.findById(dispute.matchId);
    if (!match) return res.status(404).json({ status: false, message: 'Associated match not found' });

    const p1UserId = dispute.player1.userId;
    const p2UserId = dispute.player2.userId;

    const p1Wallet = await Wallet.findOne({ userId: p1UserId });
    const p2Wallet = await Wallet.findOne({ userId: p2UserId });

    if (decision === 'P1_WIN' || decision === 'P2_WIN') {
      const winnerUserId = decision === 'P1_WIN' ? p1UserId : p2UserId;
      const loserUserId = decision === 'P1_WIN' ? p2UserId : p1UserId;
      const winnerUsername = decision === 'P1_WIN' ? dispute.player1.username : dispute.player2.username;

      const winnerWallet = decision === 'P1_WIN' ? p1Wallet : p2Wallet;
      const loserWallet = decision === 'P1_WIN' ? p2Wallet : p1Wallet;

      // Credit Prize Pool to Winner Winning Balance
      if (winnerWallet) {
        winnerWallet.winningBalance += match.prizePool;
        winnerWallet.lockedBalance = Math.max(0, winnerWallet.lockedBalance - match.entryFee);
        await winnerWallet.save();
      }

      // Deduct entry fee from loser locked balance
      if (loserWallet) {
        loserWallet.lockedBalance = Math.max(0, loserWallet.lockedBalance - match.entryFee);
        await loserWallet.save();
      }

      match.status = 'COMPLETED';
      match.winnerId = winnerUserId;
      match.resolvedAt = new Date();
      await match.save();

      dispute.status = decision === 'P1_WIN' ? 'RESOLVED_P1_WIN' : 'RESOLVED_P2_WIN';
      dispute.resolvedByAdminUsername = req.user ? req.user.username : 'superadmin';
      dispute.adminNotes = adminNotes || `Superadmin declared ${winnerUsername} as winner based on screenshot evidence.`;
      dispute.resolvedAt = new Date();
      await dispute.save();

      await Transaction.create({
        userId: winnerUserId,
        type: 'MATCH_WIN',
        amount: match.prizePool,
        subBalanceType: 'winning',
        status: 'SUCCESS',
        description: `Dispute Won: Match Prize Pool ₹${match.prizePool / 100}`
      });

      await AdminAuditLog.create({
        adminId: req.user ? req.user.id : null,
        adminUsername: req.user ? req.user.username : 'superadmin',
        action: 'RESOLVE_DISPUTE',
        targetEntity: `Dispute:${dispute._id}`,
        targetId: dispute._id.toString(),
        details: `Resolved Match Dispute: Declared ${winnerUsername} winner (Prize ₹${match.prizePool / 100}). Notes: ${adminNotes || 'N/A'}`,
        ipAddress: clientIp,
        userAgent: req.headers['user-agent'] || 'Unknown'
      });

      return res.json({ status: true, message: `Dispute resolved. ${winnerUsername} awarded ₹${match.prizePool / 100} winnings.` });
    } else {
      // REFUND BOTH
      if (p1Wallet) {
        p1Wallet.winningBalance += match.entryFee;
        p1Wallet.lockedBalance = Math.max(0, p1Wallet.lockedBalance - match.entryFee);
        await p1Wallet.save();
      }
      if (p2Wallet) {
        p2Wallet.winningBalance += match.entryFee;
        p2Wallet.lockedBalance = Math.max(0, p2Wallet.lockedBalance - match.entryFee);
        await p2Wallet.save();
      }

      match.status = 'CANCELLED';
      match.resolvedAt = new Date();
      await match.save();

      dispute.status = 'REFUNDED';
      dispute.resolvedByAdminUsername = req.user ? req.user.username : 'superadmin';
      dispute.adminNotes = adminNotes || 'Match cancelled and entry fees refunded to both players.';
      dispute.resolvedAt = new Date();
      await dispute.save();

      await AdminAuditLog.create({
        adminId: req.user ? req.user.id : null,
        adminUsername: req.user ? req.user.username : 'superadmin',
        action: 'RESOLVE_DISPUTE',
        targetEntity: `Dispute:${dispute._id}`,
        targetId: dispute._id.toString(),
        details: `Resolved Match Dispute: Cancelled match & refunded ₹${match.entryFee / 100} to both players. Notes: ${adminNotes || 'N/A'}`,
        ipAddress: clientIp,
        userAgent: req.headers['user-agent'] || 'Unknown'
      });

      return res.json({ status: true, message: 'Dispute resolved. Both players refunded entry fees.' });
    }
  } catch (error) {
    console.error('[Resolve Dispute Error]', error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

// GET /api/admin/settings & PUT /api/admin/settings (System config with IP logging)
export const getGameSettings = async (req, res) => {
  try {
    let settings = await GameSettings.findOne({ key: 'global_settings' });
    if (!settings) {
      settings = await GameSettings.create({ key: 'global_settings' });
    }
    return res.json({ status: true, message: 'Settings retrieved', data: settings });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const updateGameSettings = async (req, res) => {
  try {
    const { platformCommissionPct, minDepositRs, maxDepositRs, minWithdrawRs, maxWithdrawRs, maintenanceMode, maintenanceMessage, forceUpdateVersion } = req.body;
    const clientIp = getClientIp(req);

    let settings = await GameSettings.findOne({ key: 'global_settings' });
    if (!settings) settings = new GameSettings({ key: 'global_settings' });

    if (platformCommissionPct !== undefined) settings.platformCommissionPct = platformCommissionPct;
    if (minDepositRs !== undefined) settings.minDepositRs = minDepositRs;
    if (maxDepositRs !== undefined) settings.maxDepositRs = maxDepositRs;
    if (minWithdrawRs !== undefined) settings.minWithdrawRs = minWithdrawRs;
    if (maxWithdrawRs !== undefined) settings.maxWithdrawRs = maxWithdrawRs;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    if (maintenanceMessage !== undefined) settings.maintenanceMessage = maintenanceMessage;
    if (forceUpdateVersion !== undefined) settings.forceUpdateVersion = forceUpdateVersion;

    await settings.save();

    await AdminAuditLog.create({
      adminId: req.user ? req.user.id : null,
      adminUsername: req.user ? req.user.username : 'superadmin',
      action: 'UPDATE_SETTINGS',
      targetEntity: 'SystemSettings',
      details: `Updated Game Settings: Commission=${settings.platformCommissionPct}%, Maintenance=${settings.maintenanceMode}`,
      ipAddress: clientIp,
      userAgent: req.headers['user-agent'] || 'Unknown'
    });

    return res.json({ status: true, message: 'Game settings updated successfully', data: settings });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// GET /api/admin/audit-logs (Return all audit logs with exact IP addresses)
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AdminAuditLog.find().sort({ createdAt: -1 }).limit(100);
    return res.json({ status: true, message: 'Audit logs retrieved', data: logs });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
