import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Task, UserTask } from '@/lib/models/Task';
import { getAuthUser } from '@/lib/authHelper';
import { creditWallet } from '@/lib/walletHelper';

export async function POST(req, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      }, { status: 401 });
    }

    const { id } = await params;

    const task = await Task.findOne({
      $or: [{ taskId: id }, { _id: id }]
    });

    if (!task) {
      return NextResponse.json({
        success: false,
        error: { code: 'TASK_NOT_FOUND', message: 'Task not found' }
      }, { status: 404 });
    }

    let userTask = await UserTask.findOne({ userId: user._id, taskId: task.taskId });
    if (!userTask) {
      userTask = await UserTask.create({
        userId: user._id,
        taskId: task.taskId,
        currentProgress: 0,
        isCompleted: false,
        isClaimed: false
      });
    }

    if (userTask.isClaimed) {
      return NextResponse.json({
        success: false,
        error: { code: 'ALREADY_CLAIMED', message: 'Task reward has already been claimed' }
      }, { status: 400 });
    }

    // Check completion progress
    const gamesPlayed = user.stats?.played || 0;
    const wins = user.stats?.won || 0;
    const referredCount = user.referredBy ? 1 : 0;

    let progress = userTask.currentProgress;
    if (task.taskId === 'task_001') progress = Math.min(gamesPlayed, task.target);
    if (task.taskId === 'task_002') progress = Math.min(wins, task.target);
    if (task.taskId === 'task_003') progress = Math.min(referredCount, task.target);

    if (progress < task.target && !userTask.isCompleted) {
      return NextResponse.json({
        success: false,
        error: { code: 'TASK_NOT_COMPLETED', message: 'Task requirement has not been met yet' }
      }, { status: 400 });
    }

    userTask.isCompleted = true;
    userTask.isClaimed = true;
    userTask.claimedAt = new Date();
    await userTask.save();

    let walletData = null;
    if (task.reward > 0) {
      const { wallet } = await creditWallet({
        userId: user._id,
        amount: task.reward,
        type: 'TASK_REWARD',
        subBalanceType: task.rewardType === 'cash' ? 'winning' : 'bonus',
        referenceId: task.taskId,
        description: `Task reward: ${task.title}`
      });
      walletData = wallet;
    }

    return NextResponse.json({
      success: true,
      message: `Task reward of ₹${task.reward} claimed successfully!`,
      data: {
        task_id: task.taskId,
        reward: task.reward,
        reward_type: task.rewardType,
        is_claimed: true,
        claimed_at: userTask.claimedAt,
        new_balance: walletData ? walletData.depositBalance + walletData.winningBalance + walletData.bonusBalance : undefined
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
