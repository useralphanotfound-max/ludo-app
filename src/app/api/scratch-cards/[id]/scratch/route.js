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

    // Calculate reward amount if 0 (random within minReward and maxReward)
    let winningAmount = card.rewardAmount;
    if (!winningAmount || winningAmount === 0) {
      const min = card.minReward || 10;
      const max = card.maxReward || 50;
      winningAmount = Math.floor(Math.random() * (max - min + 1)) + min;
      card.rewardAmount = winningAmount;
    }

    card.isScratched = true;
    card.scratchedAt = new Date();
    await card.save();

    let newWalletBalance = 0;
    if (winningAmount > 0) {
      const { wallet } = await creditWallet({
        userId: user._id,
        amount: winningAmount,
        type: 'BONUS_CREDIT',
        subBalanceType: card.rewardType === 'cash' ? 'winning' : 'bonus',
        referenceId: card.cardId,
        description: `Scratch card reward: ${card.name}`
      });
      newWalletBalance = wallet.depositBalance + wallet.winningBalance + wallet.bonusBalance;
    }

    return NextResponse.json({
      success: true,
      message: `Congratulations! You won ₹${winningAmount}!`,
      data: {
        card_id: card.cardId,
        reward_amount: winningAmount,
        reward_type: card.rewardType || 'bonus',
        total_wallet_balance: newWalletBalance,
        scratched_at: card.scratchedAt
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
