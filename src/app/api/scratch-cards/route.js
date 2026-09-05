import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ScratchCard } from '@/lib/models/ScratchCard';
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

    let cards = await ScratchCard.find({ userId: user._id, isScratched: false });

    if (!cards || cards.length === 0) {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const newCard1 = await ScratchCard.create({
        cardId: `sc_${user._id.toString().slice(-4)}_${Date.now()}_1`,
        userId: user._id,
        name: 'Lucky Winner',
        rewardAmount: Math.floor(Math.random() * 50) + 10,
        rewardType: 'bonus',
        expiresAt
      });
      const newCard2 = await ScratchCard.create({
        cardId: `sc_${user._id.toString().slice(-4)}_${Date.now()}_2`,
        userId: user._id,
        name: 'Royal Bonus Card',
        rewardAmount: Math.floor(Math.random() * 100) + 25,
        rewardType: 'bonus',
        expiresAt
      });
      cards = [newCard1, newCard2];
    }

    const availableCards = cards.map(c => ({
      id: c.cardId,
      name: c.name,
      is_scratched: c.isScratched,
      expires_at: c.expiresAt,
      thumbnail_url: c.thumbnailUrl
    }));

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const scratchedToday = await ScratchCard.countDocuments({
      userId: user._id,
      isScratched: true,
      scratchedAt: { $gte: todayStart }
    });

    return NextResponse.json({
      success: true,
      data: {
        available_cards: availableCards,
        total_available: availableCards.length,
        total_scratched_today: scratchedToday,
        daily_limit: 5
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
