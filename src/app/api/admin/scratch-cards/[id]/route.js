import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ScratchCard } from '@/lib/models/ScratchCard';
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

    const card = await ScratchCard.findOne({ $or: [{ cardId: id }, { _id: id }] });
    if (!card) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Scratch card not found' } }, { status: 404 });
    }

    if (body.name) card.name = body.name;
    if (body.minReward !== undefined) card.minReward = Number(body.minReward);
    if (body.maxReward !== undefined) card.maxReward = Number(body.maxReward);
    if (body.rewardAmount !== undefined) card.rewardAmount = Number(body.rewardAmount);
    if (body.rewardType) card.rewardType = body.rewardType;
    if (body.status) card.status = body.status;

    await card.save();

    return NextResponse.json({
      success: true,
      message: 'Scratch card updated successfully',
      data: card
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
    const card = await ScratchCard.findOneAndDelete({ $or: [{ cardId: id }, { _id: id }] });
    if (!card) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Scratch card not found' } }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Scratch card deleted successfully'
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
  }
}
