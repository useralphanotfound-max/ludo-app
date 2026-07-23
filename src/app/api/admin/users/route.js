import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Wallet } from '@/lib/models/Wallet';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');

    const query = { role: 'USER' };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { username: new RegExp(search, 'i') },
        { mobile: new RegExp(search, 'i') },
        { referralCode: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 }).limit(100);
    const userIds = users.map(u => u._id);
    const wallets = await Wallet.find({ userId: { $in: userIds } });
    const walletMap = {};
    wallets.forEach(w => walletMap[w.userId.toString()] = w);

    const data = users.map(u => {
      const w = walletMap[u._id.toString()] || {};
      return {
        id: u._id,
        username: u.username,
        mobile: u.mobile,
        status: u.status,
        avatarUrl: u.avatarUrl,
        referralCode: u.referralCode,
        referredBy: u.referredBy,
        deviceId: u.deviceId,
        lastLoginAt: u.lastLoginAt,
        lastLoginIp: u.lastLoginIp,
        createdAt: u.createdAt,
        stats: u.stats,
        wallet: {
          depositBalanceRs: (w.depositBalance || 0) / 100,
          winningBalanceRs: (w.winningBalance || 0) / 100,
          bonusBalanceRs: (w.bonusBalance || 0) / 100,
          lockedBalanceRs: (w.lockedBalance || 0) / 100,
          totalBalanceRs: ((w.depositBalance || 0) + (w.winningBalance || 0) + (w.bonusBalance || 0)) / 100
        }
      };
    });

    return NextResponse.json({ status: true, message: 'Users retrieved', data });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
