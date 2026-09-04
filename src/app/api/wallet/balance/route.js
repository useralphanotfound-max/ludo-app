import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { getOrCreateWallet } from '@/lib/walletHelper';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'royal-ludo-super-secret-jwt-key-2026';

function getUserFromToken(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const userPayload = getUserFromToken(req);
    if (!userPayload) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication token required' }
      }, { status: 401 });
    }

    const wallet = await getOrCreateWallet(userPayload.userId);

    return NextResponse.json({
      success: true,
      data: {
        total_balance: wallet.depositBalance + wallet.winningBalance + wallet.bonusBalance,
        deposit_balance: wallet.depositBalance,
        winning_balance: wallet.winningBalance,
        bonus_balance: wallet.bonusBalance,
        withdrawal_balance: wallet.winningBalance,
        pending_balance: wallet.pendingBalance || 0,
        currency: 'INR'
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
