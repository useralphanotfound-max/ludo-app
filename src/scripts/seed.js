import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../lib/models/User.js';
import { Wallet } from '../lib/models/Wallet.js';
import { Transaction } from '../lib/models/Transaction.js';
import { Room } from '../lib/models/Room.js';
import { Match } from '../lib/models/Match.js';
import { Dispute } from '../lib/models/Dispute.js';
import { WithdrawalRequest } from '../lib/models/WithdrawalRequest.js';
import { GameSettings } from '../lib/models/GameSettings.js';
import { AdminAuditLog } from '../lib/models/AdminAuditLog.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://royaluseralpha83993:royaluseralphapass83993@cluster0.xmyjibo.mongodb.net/royalludo?retryWrites=true&w=majority';

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('[Seed] Connected successfully. Cleaning old collections...');

    await User.deleteMany({});
    await Wallet.deleteMany({});
    await Transaction.deleteMany({});
    await Room.deleteMany({});
    await Match.deleteMany({});
    await Dispute.deleteMany({});
    await WithdrawalRequest.deleteMany({});
    await GameSettings.deleteMany({});
    await AdminAuditLog.deleteMany({});

    console.log('[Seed] Creating Superadmin Account...');
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('RoyalAdmin@123', salt);

    const superadmin = await User.create({
      username: 'admin@royalludo.com',
      mobile: '9999999999',
      passwordHash: adminPasswordHash,
      role: 'SUPERADMIN',
      status: 'ACTIVE',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=superadmin',
      referralCode: 'ROYALADMIN'
    });

    console.log('[Seed] Creating Sample App Users...');
    const userPasswordHash = await bcrypt.hash('Royal@123', salt);

    const u1 = await User.create({
      username: 'kingplayer',
      mobile: '9876543210',
      passwordHash: userPasswordHash,
      role: 'USER',
      status: 'ACTIVE',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=kingplayer',
      referralCode: 'ROYAL50',
      deviceId: 'android-dev-101',
      stats: { played: 24, won: 18, lost: 6, totalWinningsPaise: 250000 }
    });

    const u2 = await User.create({
      username: 'ludomaster',
      mobile: '9876543211',
      passwordHash: userPasswordHash,
      role: 'USER',
      status: 'ACTIVE',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=ludomaster',
      referralCode: 'LUDO100',
      deviceId: 'android-dev-102',
      stats: { played: 30, won: 15, lost: 15, totalWinningsPaise: 180000 }
    });

    console.log('[Seed] Creating User Wallets...');
    await Wallet.create({ userId: superadmin._id, depositBalance: 0 });
    await Wallet.create({ userId: u1._id, depositBalance: 50000, winningBalance: 125000, bonusBalance: 2500 });
    await Wallet.create({ userId: u2._id, depositBalance: 20000, winningBalance: 75000, bonusBalance: 1000 });

    console.log('[Seed] Creating System Settings...');
    await GameSettings.create({
      key: 'global_settings',
      platformCommissionPct: 10,
      minDepositRs: 50,
      maxDepositRs: 50000,
      minWithdrawRs: 100,
      maxWithdrawRs: 25000,
      autoPayoutThresholdRs: 1000,
      maintenanceMode: false,
      forceUpdateVersion: '1.0.0'
    });

    console.log('[Seed] Creating Sample Pending Cashout Withdrawals...');
    await WithdrawalRequest.create({
      userId: u1._id,
      username: u1.username,
      mobile: u1.mobile,
      amountPaise: 50000,
      payoutMethod: 'UPI',
      accountDetails: { upiId: 'kingplayer@upi', accountHolderName: 'King Player' },
      status: 'PENDING_APPROVAL',
      riskScore: 'LOW'
    });

    console.log('[Seed] Creating Active Game Rooms & Match Disputes...');
    const room1 = await Room.create({
      creatorId: u1._id,
      gameMode: 'CLASSIC',
      playerCount: 2,
      entryFee: 50000,
      roomCode: '882910',
      status: 'IN_PROGRESS',
      joinedPlayers: [u1._id, u2._id]
    });

    const match1 = await Match.create({
      roomId: room1._id,
      gameMode: 'CLASSIC',
      entryFee: 50000,
      prizePool: 90000,
      players: [
        { userId: u1._id, username: u1.username, avatarUrl: u1.avatarUrl },
        { userId: u2._id, username: u2.username, avatarUrl: u2.avatarUrl }
      ],
      status: 'DISPUTED'
    });

    await Dispute.create({
      matchId: match1._id,
      roomId: room1._id,
      player1: {
        userId: u1._id,
        username: u1.username,
        claimedResult: 'WON',
        screenshotUrl: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=800&q=80',
        submittedAt: new Date()
      },
      player2: {
        userId: u2._id,
        username: u2.username,
        claimedResult: 'WON',
        screenshotUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80',
        submittedAt: new Date()
      },
      status: 'PENDING_ADMIN_REVIEW'
    });

    console.log('[Seed] Creating Initial Admin Audit Log Entry...');
    await AdminAuditLog.create({
      adminId: superadmin._id,
      adminUsername: superadmin.username,
      action: 'ADMIN_LOGIN',
      details: 'Database seeded for Next.js App Router platform',
      ipAddress: '127.0.0.1 (Localhost)',
      userAgent: 'NextJsSeedScript/1.0'
    });

    console.log('=============================================================');
    console.log('✅ MongoDB Database Seeded Successfully for Next.js!');
    console.log('👑 Superadmin Credentials:');
    console.log('   Username / Email: admin@royalludo.com');
    console.log('   Password:         RoyalAdmin@123');
    console.log('   Login URL:        http://localhost:3000/superadmin/login');
    console.log('=============================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedDatabase();
