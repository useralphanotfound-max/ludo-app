import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Task } from '@/lib/models/Task';
import { getAuthUser } from '@/lib/authHelper';

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

    const tasks = await Task.find({ isActive: true }).lean();

    const taskList = tasks.map(t => {
      const isClaimed = (t.claimedUserIds || []).some(id => id.toString() === user._id.toString());
      let currentProgress = 0;
      if (t.type === 'PLAY_MATCHES') currentProgress = user.stats?.played || 0;
      else if (t.type === 'WIN_MATCHES') currentProgress = user.stats?.won || 0;
      else if (t.type === 'DEPOSIT') currentProgress = 1;

      return {
        task_id: t._id.toString(),
        title: t.title,
        description: t.description,
        reward_rs: t.rewardRs,
        target_count: t.targetCount,
        current_progress: currentProgress,
        is_completed: currentProgress >= t.targetCount,
        is_claimed: isClaimed
      };
    });

    return NextResponse.json({
      success: true,
      status: true,
      data: {
        tasks: taskList,
        total_completed: taskList.filter(t => t.is_completed).length
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
