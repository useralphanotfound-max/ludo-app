import mongoose from 'mongoose';
import { Room } from '../lib/models/Room.js';
import { Wallet } from '../lib/models/Wallet.js';
import { Transaction } from '../lib/models/Transaction.js';
import { User } from '../lib/models/User.js';
import { Task } from '../lib/models/Task.js';
import { ScratchCard } from '../lib/models/ScratchCard.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/royalludo';

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI);
}

async function processRoomExpiries() {
  try {
    await connectDB();
    const now = new Date();

    const expiredRooms = await Room.find({
      status: { $in: ['WAITING_FOR_OPPONENT', 'WAITING', 'OPEN'] },
      expiresAt: { $lte: now },
      refundedAt: null
    });

    for (const room of expiredRooms) {
      room.status = 'EXPIRED';
      room.refundedAt = now;
      await room.save();

      let wallet = await Wallet.findOne({ userId: room.creatorId });
      if (wallet) {
        wallet.depositBalance += room.entryFee;
        wallet.lockedBalance = Math.max(0, wallet.lockedBalance - room.entryFee);
        await wallet.save();
      }

      await Transaction.create({
        userId: room.creatorId,
        type: 'REFUND',
        amount: room.entryFee,
        subBalanceType: 'deposit',
        status: 'SUCCESS',
        referenceId: room.roomCode,
        description: `Auto-refund for expired room #${room.roomCode}`
      });

      console.log(`[Worker] Expired room #${room.roomCode} - Refunded ₹${room.entryFee} to Creator.`);
    }
  } catch (err) {
    console.error('[Worker] Error processing room expiries:', err.message);
  }
}

let lastResetDate = null;
async function checkDailyCronJobs() {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    if (lastResetDate === todayStr) return;

    const now = new Date();
    // Trigger at midnight 00:00 UTC
    if (now.getUTCHours() === 0 && now.getUTCMinutes() === 0) {
      await connectDB();
      console.log('[Worker Cron] Running Daily Reset and Scratch Card Allocation...');

      // Reset Daily Tasks
      await Task.updateMany(
        { frequency: 'DAILY' },
        { $set: { progress: 0, status: 'PENDING', isClaimed: false } }
      );

      // Allocate Daily Scratch Card
      const activeUsers = await User.find({ status: 'ACTIVE' }).select('_id').lean();
      const scratchCards = activeUsers.map(u => ({
        userId: u._id,
        title: 'Daily Reward Scratch Card',
        rewardType: 'BONUS',
        minReward: 5,
        maxReward: 50,
        isScratched: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }));

      if (scratchCards.length > 0) {
        await ScratchCard.insertMany(scratchCards);
      }

      lastResetDate = todayStr;
      console.log(`[Worker Cron] Daily Reset completed. Allocated ${scratchCards.length} scratch cards.`);
    }
  } catch (err) {
    console.error('[Worker Cron] Daily cron error:', err.message);
  }
}

console.log('🚀 Royal Ludo Background Worker Started...');
setInterval(async () => {
  await processRoomExpiries();
  await checkDailyCronJobs();
}, 10000); // Run every 10 seconds
