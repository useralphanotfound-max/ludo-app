import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Transaction } from '@/lib/models/Transaction';
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);
    const typeFilter = searchParams.get('type') || 'all';

    const query = { userId: userPayload.userId };
    if (typeFilter !== 'all') {
      const upper = typeFilter.toUpperCase();
      if (upper === 'DEPOSIT') query.type = 'DEPOSIT';
      else if (upper === 'WITHDRAW') query.type = 'WITHDRAWAL';
      else if (upper === 'WIN') query.type = 'MATCH_WIN';
      else if (upper === 'ENTRY') query.type = 'MATCH_ENTRY';
      else if (upper === 'REFUND') query.type = 'REFUND';
      else if (upper === 'BONUS') query.type = 'BONUS_CREDIT';
    }

    const skip = (page - 1) * limit;
    const [transactions, totalCount] = await Promise.all([
      Transaction.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Transaction.countDocuments(query)
    ]);

    const formattedTxns = transactions.map(t => {
      const isCredit = ['DEPOSIT', 'MATCH_WIN', 'REFUND', 'BONUS_CREDIT'].includes(t.type);
      return {
        id: t._id.toString(),
        type: t.type,
        title: t.type.replace('_', ' '),
        description: t.description || `${t.type} transaction`,
        amount: t.amount,
        is_credit: isCredit,
        sub_balance_type: t.subBalanceType,
        previous_balance: t.previousBalance,
        new_balance: t.newBalance,
        status: t.status,
        reference_id: t.referenceId,
        created_at: t.createdAt
      };
    });

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return NextResponse.json({
      success: true,
      data: {
        transactions: formattedTxns,
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_count: totalCount,
          has_next: page < totalPages
        }
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
