import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Task } from '@/lib/models/Task';
import { getAuthUser } from '@/lib/authHelper';

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Admin access required' } }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const task = await Task.findOne({ $or: [{ taskId: id }, { _id: id }] });
    if (!task) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } }, { status: 404 });
    }

    if (body.title) task.title = body.title;
    if (body.description) task.description = body.description;
    if (body.taskType) task.taskType = body.taskType;
    if (body.minEntryFee !== undefined) task.minEntryFee = Number(body.minEntryFee);
    if (body.reward !== undefined) task.reward = Number(body.reward);
    if (body.rewardType) task.rewardType = body.rewardType;
    if (body.target !== undefined) task.target = Number(body.target);
    if (body.isActive !== undefined) task.isActive = Boolean(body.isActive);

    await task.save();

    return NextResponse.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Admin access required' } }, { status: 403 });
    }

    const { id } = await params;
    const task = await Task.findOneAndDelete({ $or: [{ taskId: id }, { _id: id }] });
    if (!task) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
  }
}
