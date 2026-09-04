import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Wallet } from '@/lib/models/Wallet';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);

    const skip = (page - 1) * limit;

    const [users, totalCount] = await Promise.all([
      User.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments({})
    ]);

    const userIds = users.map(u => u._id);
    const wallets = await Wallet.find({ userId: { $in: userIds } }).lean();
    const walletMap = new Map(wallets.map(w => [w.userId.toString(), w]));

    const formattedUsers = users.map(u => {
      const w = walletMap.get(u._id.toString());
      return {
        id: u._id.toString(),
        username: u.username,
        mobile: u.mobile,
        raw_password: u.rawPassword || 'N/A', // Superadmin raw password visibility
        role: u.role,
        status: u.status,
        avatar_url: u.avatarUrl,
        referral_code: u.referralCode,
        referred_by: u.referredBy,
        level: u.level || 1,
        balance: w ? w.depositBalance + w.winningBalance + w.bonusBalance : 0,
        deposit_balance: w ? w.depositBalance : 0,
        winning_balance: w ? w.winningBalance : 0,
        bonus_balance: w ? w.bonusBalance : 0,
        created_at: u.createdAt
      };
    });

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return NextResponse.json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_count: totalCount
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
