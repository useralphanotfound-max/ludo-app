import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Room } from '@/lib/models/Room';
import { User } from '@/lib/models/User';
import { Task } from '@/lib/models/Task';
import { ScratchCard } from '@/lib/models/ScratchCard';
import { refundWallet } from '@/lib/walletHelper';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  return runBackgroundWorker();
}

export async function POST(req) {
  return runBackgroundWorker();
}

async function runBackgroundWorker() {
  try {
    await connectDB();
    const now = new Date();

    // 1. Room Waiting Expiry Worker (Check for rooms expired < NOW())
    const expiredRooms = await Room.find({
      status: { $in: ['WAITING_FOR_OPPONENT', 'WAITING', 'OPEN'] },
      expiresAt: { $lte: now },
      refundedAt: null
    });

    let expiredCount = 0;
    for (const room of expiredRooms) {
      room.status = 'EXPIRED';
      room.refundedAt = now;
      await room.save();

      // Refund Entry Fee to Creator Wallet
      await refundWallet({
        userId: room.creatorId,
        amount: room.entryFee,
        referenceId: room.roomCode,
        description: `Auto-refund for expired room #${room.roomCode}`
      }).catch(err => console.error(`Refund error for room ${room.roomCode}:`, err));

      expiredCount++;
    }

    // 2. Check if Daily Reset is required (or forced via parameter ?forceDaily=true)
    const { searchParams } = new URL(req.url || 'http://localhost');
    const forceDaily = searchParams.get('forceDaily') === 'true';

    let dailyTaskResetCount = 0;
    let dailyScratchCardAllocated = 0;

    if (forceDaily) {
      // Reset Daily Tasks Progress
      await Task.updateMany(
        { frequency: 'DAILY' },
        { $set: { progress: 0, status: 'PENDING', isClaimed: false } }
      );
      dailyTaskResetCount = await Task.countDocuments({ frequency: 'DAILY' });

      // Allocate Daily Scratch Card to Active Users
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
        dailyScratchCardAllocated = scratchCards.length;
      }
    }

    return NextResponse.json({
      success: true,
      status: true,
      message: `Worker executed successfully. Expired & refunded ${expiredCount} rooms.`,
      data: {
        expired_rooms_count: expiredCount,
        daily_tasks_reset_count: dailyTaskResetCount,
        daily_scratch_cards_allocated: dailyScratchCardAllocated,
        executed_at: now.toISOString()
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
