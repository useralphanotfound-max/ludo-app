import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Task } from '@/lib/models/Task';
import { getAuthUser } from '@/lib/authHelper';

export async function GET(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Admin access required' } }, { status: 403 });
    }

    const tasks = await Task.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: { tasks, total: tasks.length }
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Admin access required' } }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, taskType, minEntryFee, reward, rewardType, target, isActive } = body;

    if (!title || reward === undefined || !target) {
      return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'title, reward, and target are required' } }, { status: 400 });
    }

    const taskId = `task_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

    const newTask = await Task.create({
      taskId,
      title,
      description: description || title,
      taskType: taskType || 'PLAY_MATCHES',
      minEntryFee: minEntryFee ? Number(minEntryFee) : 0,
      reward: Number(reward),
      rewardType: rewardType || 'bonus',
      target: Number(target),
      isActive: isActive !== undefined ? Boolean(isActive) : true
    });

    return NextResponse.json({
      success: true,
      message: 'Task created successfully',
      data: newTask
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
  }
}
