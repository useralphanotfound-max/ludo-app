import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ScratchCard } from '@/lib/models/ScratchCard';
import { User } from '@/lib/models/User';
import { getAuthUser } from '@/lib/authHelper';

export async function GET(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Admin access required' } }, { status: 403 });
    }

    const cards = await ScratchCard.find()
      .populate('userId', 'username mobile avatarUrl')
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({
      success: true,
      data: { scratch_cards: cards, total: cards.length }
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
    const { name, minReward, maxReward, rewardAmount, rewardType, targetUserId, issueToAll, status } = body;

    const min = Number(minReward || rewardAmount || 10);
    const max = Number(maxReward || rewardAmount || 50);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days validity

    let createdCards = [];

    if (issueToAll) {
      const allUsers = await User.find({ role: { $ne: 'SUPERADMIN' } });
      if (allUsers.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No active player accounts found in database to issue cards to.',
          data: { count: 0 }
        }, { status: 200 });
      }

      const docs = allUsers.map(u => ({
        cardId: `sc_adm_${u._id.toString().slice(-4)}_${Date.now()}_${Math.floor(Math.random()*1000)}`,
        userId: u._id,
        name: name || 'Admin Special Scratch Card',
        minReward: min,
        maxReward: max,
        rewardAmount: rewardAmount ? Number(rewardAmount) : 0,
        rewardType: rewardType || 'bonus',
        status: status || 'ACTIVE',
        expiresAt
      }));
      createdCards = await ScratchCard.insertMany(docs);
    } else if (targetUserId) {
      const singleCard = await ScratchCard.create({
        cardId: `sc_adm_${targetUserId.slice(-4)}_${Date.now()}`,
        userId: targetUserId,
        name: name || 'Special Bonus Scratch Card',
        minReward: min,
        maxReward: max,
        rewardAmount: rewardAmount ? Number(rewardAmount) : 0,
        rewardType: rewardType || 'bonus',
        status: status || 'ACTIVE',
        expiresAt
      });
      createdCards = [singleCard];
    } else {
      return NextResponse.json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Please specify targetUserId or issueToAll: true' }
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Issued ${createdCards.length} scratch card(s) successfully`,
      data: { count: createdCards.length, sample: createdCards[0] }
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
  }
}
