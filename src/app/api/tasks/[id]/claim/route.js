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

    const taskIdParam = params.id;

    const task = await Task.findOne({
      $or: [{ taskId: taskIdParam }, { _id: taskIdParam }]
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
        currentProgress: task.target,
        isCompleted: true,
        isClaimed: false
      });
    }

    if (userTask.isClaimed) {
      return NextResponse.json({
        success: false,
        error: { code: 'REWARD_ALREADY_CLAIMED', message: 'Reward for this task has already been claimed' }
      }, { status: 400 });
    }

    userTask.isCompleted = true;
    userTask.isClaimed = true;
    userTask.claimedAt = new Date();
    await userTask.save();

    const { wallet } = await creditWallet({
      userId: user._id,
      amount: task.reward,
      type: 'BONUS_CREDIT',
      subBalanceType: task.rewardType === 'cash' ? 'winning' : 'bonus',
      referenceId: task.taskId,
      description: `Task reward: ${task.title}`
    });

    return NextResponse.json({
      success: true,
      message: `Reward claimed! ₹${task.reward} ${task.rewardType} added to your wallet.`,
      data: {
        task_id: task.taskId,
        reward: task.reward,
        reward_type: task.rewardType,
        new_bonus_balance: wallet.bonusBalance
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
