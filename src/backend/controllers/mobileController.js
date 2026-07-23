import { User } from '../models/User.js';
import { Wallet } from '../models/Wallet.js';
import { Transaction } from '../models/Transaction.js';
import { Room } from '../models/Room.js';
import { Match } from '../models/Match.js';
import { Dispute } from '../models/Dispute.js';
import { WithdrawalRequest } from '../models/WithdrawalRequest.js';
import { GameSettings } from '../models/GameSettings.js';
import { SupportTicket } from '../models/SupportTicket.js';

// GET /api/dashboard
export const getMobileDashboard = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    let walletData = { availableBalance: 0, depositBalance: 0, winningBalance: 0, bonusBalance: 0 };
    let userProfile = { username: 'Guest', avatarUrl: '' };

    if (userId) {
      const user = await User.findById(userId);
      const wallet = await Wallet.findOne({ userId });
      if (user) {
        userProfile = { username: user.username, avatarUrl: user.avatarUrl, referralCode: user.referralCode };
      }
      if (wallet) {
        walletData = {
          depositBalance: wallet.depositBalance / 100,
          winningBalance: wallet.winningBalance / 100,
          bonusBalance: wallet.bonusBalance / 100,
          availableBalance: (wallet.depositBalance + wallet.winningBalance + wallet.bonusBalance) / 100
        };
      }
    }

    const activeRooms = await Room.find({ status: 'WAITING' }).limit(5);
    const settings = await GameSettings.findOne({ key: 'global_settings' }) || {};

    return res.json({
      status: true,
      message: 'Dashboard loaded',
      data: {
        user: userProfile,
        wallet: walletData,
        banners: [
          { id: 'b1', title: 'Royal Tournament Season 1', imageUrl: 'https://picsum.photos/800/300?random=1', deeplink: 'royalludo://promo/1' },
          { id: 'b2', title: 'Get 50% Bonus on First Deposit', imageUrl: 'https://picsum.photos/800/300?random=2', deeplink: 'royalludo://promo/2' }
        ],
        activeMatches: activeRooms.map(r => ({
          roomId: r._id,
          roomCode: r.roomCode,
          mode: r.gameMode,
          entryFeeRs: r.entryFee / 100,
          playersJoined: r.joinedPlayers.length,
          playersMax: r.playerCount
        })),
        leaderboardTop3: [
          { rank: 1, username: 'RoyalKing99', winningsRs: 12500 },
          { rank: 2, username: 'LudoMaster_AP', winningsRs: 9800 },
          { rank: 3, username: 'WinnerPro', winningsRs: 7400 }
        ],
        maintenance: { inMaintenance: settings.maintenanceMode, message: settings.maintenanceMessage }
      }
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// GET /api/user/profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const wallet = await Wallet.findOne({ userId: req.user.id });
    if (!user) return res.status(404).json({ status: false, message: 'User not found' });

    return res.json({
      status: true,
      message: 'User profile retrieved',
      data: {
        id: user._id,
        username: user.username,
        mobile: user.mobile,
        avatarUrl: user.avatarUrl,
        referralCode: user.referralCode,
        stats: user.stats,
        wallet: {
          depositBalanceRs: (wallet?.depositBalance || 0) / 100,
          winningBalanceRs: (wallet?.winningBalance || 0) / 100,
          bonusBalanceRs: (wallet?.bonusBalance || 0) / 100,
          totalBalanceRs: ((wallet?.depositBalance || 0) + (wallet?.winningBalance || 0) + (wallet?.bonusBalance || 0)) / 100
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// GET /api/wallet
export const getWalletBalance = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user.id });
    if (!wallet) return res.status(404).json({ status: false, message: 'Wallet not found' });

    return res.json({
      status: true,
      message: 'Wallet retrieved',
      data: {
        depositBalanceRs: wallet.depositBalance / 100,
        winningBalanceRs: wallet.winningBalance / 100,
        bonusBalanceRs: wallet.bonusBalance / 100,
        lockedBalanceRs: wallet.lockedBalance / 100,
        totalBalanceRs: (wallet.depositBalance + wallet.winningBalance + wallet.bonusBalance) / 100
      }
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// POST /api/wallet/deposit/initiate
export const initiateDeposit = async (req, res) => {
  try {
    const { amountRs, paymentMethod = 'UPI' } = req.body;
    if (!amountRs || amountRs <= 0) return res.status(400).json({ status: false, message: 'Valid amount required' });

    const amountPaise = Math.round(amountRs * 100);
    const user = await User.findById(req.user.id);
    let wallet = await Wallet.findOne({ userId: req.user.id });
    if (!wallet) wallet = await Wallet.create({ userId: req.user.id });

    wallet.depositBalance += amountPaise;
    await wallet.save();

    const tx = await Transaction.create({
      userId: req.user.id,
      type: 'DEPOSIT',
      amount: amountPaise,
      subBalanceType: 'deposit',
      status: 'SUCCESS',
      gatewayReferenceId: 'PAY_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      description: `Deposit via ${paymentMethod}`
    });

    return res.json({
      status: true,
      message: 'Deposit successful',
      data: {
        transactionId: tx._id,
        amountRs,
        updatedDepositBalanceRs: wallet.depositBalance / 100
      }
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// POST /api/wallet/withdraw/initiate (100% net amount, no TDS)
export const initiateWithdrawal = async (req, res) => {
  try {
    const { amountRs, payoutMethod = 'UPI', upiId, accountNumber, ifscCode, accountHolderName } = req.body;
    if (!amountRs || amountRs <= 0) return res.status(400).json({ status: false, message: 'Valid amount required' });

    const amountPaise = Math.round(amountRs * 100);
    const user = await User.findById(req.user.id);
    const wallet = await Wallet.findOne({ userId: req.user.id });

    if (!wallet) return res.status(404).json({ status: false, message: 'Wallet not found' });

    const availableWithdrawable = wallet.depositBalance + wallet.winningBalance;
    if (amountPaise > availableWithdrawable) {
      return res.status(400).json({ status: false, message: 'Insufficient withdrawable balance' });
    }

    // Debit available balance into locked balance pending admin approval
    if (wallet.winningBalance >= amountPaise) {
      wallet.winningBalance -= amountPaise;
    } else {
      const remainder = amountPaise - wallet.winningBalance;
      wallet.winningBalance = 0;
      wallet.depositBalance -= remainder;
    }
    wallet.lockedBalance += amountPaise;
    await wallet.save();

    const withdrawal = await WithdrawalRequest.create({
      userId: user._id,
      username: user.username,
      mobile: user.mobile,
      amountPaise,
      payoutMethod,
      accountDetails: { upiId, accountNumber, ifscCode, accountHolderName },
      status: 'PENDING_APPROVAL'
    });

    return res.json({
      status: true,
      message: 'Withdrawal request submitted for processing',
      data: {
        withdrawalId: withdrawal._id,
        amountRs,
        status: withdrawal.status
      }
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// GET /api/rooms & POST /api/rooms
export const getAvailableRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ status: 'WAITING' }).sort({ createdAt: -1 });
    return res.json({ status: true, message: 'Rooms retrieved', data: rooms });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const createRoom = async (req, res) => {
  try {
    const { gameMode = 'CLASSIC', playerCount = 2, entryFeeRs = 100, isPrivate = false } = req.body;
    const entryFeePaise = Math.round(entryFeeRs * 100);

    const wallet = await Wallet.findOne({ userId: req.user.id });
    if (!wallet || (wallet.depositBalance + wallet.winningBalance + wallet.bonusBalance) < entryFeePaise) {
      return res.status(400).json({ status: false, message: 'Insufficient balance for entry fee' });
    }

    // Lock entry fee
    wallet.depositBalance = Math.max(0, wallet.depositBalance - entryFeePaise);
    wallet.lockedBalance += entryFeePaise;
    await wallet.save();

    const roomCode = Math.floor(100000 + Math.random() * 900000).toString();

    const room = await Room.create({
      creatorId: req.user.id,
      gameMode,
      playerCount,
      entryFee: entryFeePaise,
      roomCode,
      isPrivate,
      joinedPlayers: [req.user.id],
      status: 'WAITING'
    });

    return res.status(201).json({ status: true, message: 'Room created successfully', data: room });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// GET /api/cms/version-check
export const checkAppVersion = async (req, res) => {
  try {
    const settings = await GameSettings.findOne({ key: 'global_settings' }) || {};
    return res.json({
      status: true,
      message: 'Version status',
      data: {
        latestVersion: settings.forceUpdateVersion || '1.0.0',
        forceUpdate: false,
        updateUrl: 'https://royalludo.com/download'
      }
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
