import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Task, UserTask } from '@/lib/models/Task';
import { User } from '@/lib/models/User';
import { getAuthUser } from '@/lib/authHelper';

const DEFAULT_TASKS = [
  {
    taskId: 'task_001',
    title: 'Play 5 Games Today',
    description: 'Play 5 matches to earn bonus coins',
    reward: 100.00,
    rewardType: 'bonus',
    target: 5
  },
  {
    taskId: 'task_002',
    title: 'Win Your First Classic Match',
    description: 'Win a Classic mode game',
    reward: 200.00,
    rewardType: 'bonus',
    target: 1
  },
  {
    taskId: 'task_003',
    title: 'Refer a Friend',
    description: 'Invite a friend and earn big',
    reward: 50.00,
    rewardType: 'bonus',
    target: 1
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

      if (t.taskId === 'task_001') progress = Math.min(gamesPlayed, t.target);
      if (t.taskId === 'task_002') progress = Math.min(wins, t.target);
      if (t.taskId === 'task_003') progress = Math.min(referredCount, t.target);

      const isCompleted = ut?.isCompleted || progress >= t.target;

      return {
        id: t.taskId,
        title: t.title,
        description: t.description,
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
