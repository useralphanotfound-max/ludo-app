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
      const totalWallet = w ? w.depositBalance + w.winningBalance + w.bonusBalance : 0;
      const mob = u.mobile || '';
      const maskedMobile = mob.length >= 10 ? `${mob.slice(0, 3)}****${mob.slice(-3)}` : mob;

      return {
        id: u._id.toString(),
        username: u.username || 'Unset Profile',
        mobile: mob,
        maskedMobile,
        raw_password: u.rawPassword || 'N/A',
        rawPassword: u.rawPassword || 'N/A',
        role: u.role || 'USER',
        status: u.status || 'ACTIVE',
        kycStatus: u.kycStatus || 'NONE',
        avatar_url: u.avatarUrl || 'https://cdn.royalludo.com/avatars/av1.png',
        referral_code: u.referralCode,
        referred_by: u.referredBy,
        level: u.level || 1,
        wallet: {
          totalBalanceRs: totalWallet,
          depositBalance: w ? w.depositBalance : 0,
          winningBalance: w ? w.winningBalance : 0,
          bonusBalance: w ? w.bonusBalance : 0
        },
        financials: {
          totalDepositsRs: 0,
          totalWithdrawalsRs: 0
        },
        stats: {
          won: 0,
          lost: 0
        },
        riskScore: u.riskScore || 'LOW',
        created_at: u.createdAt,
        createdAt: u.createdAt
      };
    });

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return NextResponse.json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          page,
          totalPages,
          total: totalCount,
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
