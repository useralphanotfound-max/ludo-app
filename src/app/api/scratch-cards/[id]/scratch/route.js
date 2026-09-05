import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ScratchCard } from '@/lib/models/ScratchCard';
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

    const cardIdParam = params.id;

    const card = await ScratchCard.findOne({
      $or: [{ cardId: cardIdParam }, { _id: cardIdParam }],
      userId: user._id
    });

    if (!card) {
      return NextResponse.json({
        success: false,
        error: { code: 'CARD_NOT_FOUND', message: 'Scratch card not found' }
      }, { status: 404 });
    }

    if (card.isScratched) {
      return NextResponse.json({
        success: false,
        error: { code: 'ALREADY_SCRATCHED', message: 'This card has already been scratched' }
      }, { status: 400 });
    }

    card.isScratched = true;
    card.scratchedAt = new Date();
    await card.save();

    let newBonusBalance = 0;
    if (card.rewardAmount > 0) {
      const { wallet } = await creditWallet({
        userId: user._id,
        amount: card.rewardAmount,
        type: 'BONUS_CREDIT',
        subBalanceType: card.rewardType === 'cash' ? 'winning' : 'bonus',
        referenceId: card.cardId,
        description: `Scratch card reward: ${card.name}`
      });
      newBonusBalance = wallet.bonusBalance;
    }

    if (card.rewardAmount > 0) {
      return NextResponse.json({
        success: true,
        message: `Congratulations! You won ₹${card.rewardAmount}!`,
        data: {
          card_id: card.cardId,
          reward_amount: card.rewardAmount,
          reward_type: card.rewardType || 'bonus',
          new_bonus_balance: newBonusBalance,
          scratched_at: card.scratchedAt
        }
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: true,
        message: 'Better luck next time!',
        data: {
          card_id: card.cardId,
          reward_amount: 0,
          reward_type: null,
          scratched_at: card.scratchedAt
        }
      }, { status: 200 });
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
