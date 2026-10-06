import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Task, UserTask } from '@/lib/models/Task';
import { User } from '@/lib/models/User';
import { getAuthUser } from '@/lib/authHelper';

const DEFAULT_TASKS = [
  {
    taskId: 'task_001',
    title: 'Play 3 Matches Today',
    description: 'Play 3 matches to earn ₹30 bonus',
    taskType: 'PLAY_MATCHES',
    minEntryFee: 0,
    reward: 30.00,
    rewardType: 'bonus',
    target: 3
  },
  {
    taskId: 'task_002',
    title: 'Win Your First Classic Match',
    description: 'Win 1 Classic mode game to get ₹50 bonus',
    taskType: 'WIN_MATCHES',
    minEntryFee: 0,
    reward: 50.00,
    rewardType: 'bonus',
    target: 1
  },
  {
    taskId: 'task_003',
    title: 'Play High Stakes (₹100+ Entry)',
    description: 'Play 3 matches with ₹100 or higher bet to earn ₹100 bonus',
    taskType: 'PLAY_HIGH_STAKES',
    minEntryFee: 100,
    reward: 100.00,
    rewardType: 'bonus',
    target: 3
  }
];

export async function GET(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      }, { status: 401 });
    }

    let tasks = await Task.find({ isActive: true });
    if (!tasks || tasks.length === 0) {
      tasks = await Task.insertMany(DEFAULT_TASKS);
    }

    const userTasks = await UserTask.find({ userId: user._id });
    const userTaskMap = new Map(userTasks.map(ut => [ut.taskId, ut]));

    const gamesPlayed = user.stats?.played || 0;
    const wins = user.stats?.won || 0;
    const referredCount = user.referredBy ? 1 : 0;

    const formattedTasks = tasks.map(t => {
      const ut = userTaskMap.get(t.taskId);
      let progress = ut?.currentProgress || 0;

      if (t.taskType === 'PLAY_MATCHES') progress = Math.max(progress, Math.min(gamesPlayed, t.target));
      if (t.taskType === 'WIN_MATCHES') progress = Math.max(progress, Math.min(wins, t.target));
      if (t.taskType === 'REFER_FRIENDS') progress = Math.max(progress, Math.min(referredCount, t.target));
      if (t.taskType === 'DAILY_LOGIN') progress = 1;

      const isCompleted = ut?.isCompleted || progress >= t.target;

      return {
        id: t.taskId,
        title: t.title,
        description: t.description,
        task_type: t.taskType || 'PLAY_MATCHES',
        min_entry_fee: t.minEntryFee || 0,
        reward: t.reward,
        reward_type: t.rewardType,
        current_progress: progress,
        target: t.target,
        is_completed: isCompleted,
        is_claimed: ut?.isClaimed || false,
        expires_at: t.expiresAt
      };
    });

    const completedTasksCount = formattedTasks.filter(t => t.is_completed).length;

    return NextResponse.json({
      success: true,
      data: {
        tasks: formattedTasks,
        total_tasks: formattedTasks.length,
        completed_tasks: completedTasksCount
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
