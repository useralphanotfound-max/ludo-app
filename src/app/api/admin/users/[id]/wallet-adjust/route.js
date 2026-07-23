import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Wallet } from '@/lib/models/Wallet';
import { Transaction } from '@/lib/models/Transaction';
import { AdminAuditLog } from '@/lib/models/AdminAuditLog';
import { getClientIp } from '@/lib/ipHelper';

export const dynamic = 'force-dynamic';

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();
    const { amountRs, subBalanceType, actionType, reason } = body;
    const clientIp = getClientIp(req);

    if (!amountRs || amountRs <= 0 || !reason) {
      return NextResponse.json({ status: false, message: 'Valid amount (in ₹) and mandatory reason note are required' }, { status: 400 });
    }

    const user = await User.findById(id);
    if (!user) return NextResponse.json({ status: false, message: 'User not found' }, { status: 404 });

    let wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) wallet = await Wallet.create({ userId: user._id });

    const amountPaise = Math.round(amountRs * 100);
    const delta = actionType === 'DEBIT' ? -amountPaise : amountPaise;
    const targetField = `${subBalanceType || 'deposit'}Balance`;
    const previousBalance = wallet[targetField] || 0;
    const newBalance = previousBalance + delta;

    if (newBalance < 0) {
      return NextResponse.json({ status: false, message: `Insufficient ${subBalanceType} balance for debit action` }, { status: 400 });
    }

    wallet[targetField] = newBalance;
    await wallet.save();

    await Transaction.create({
      userId: user._id,
      type: 'MANUAL_ADJUSTMENT',
      amount: delta,
      subBalanceType: subBalanceType || 'deposit',
      status: 'SUCCESS',
      description: `Admin manual ${actionType}: ₹${amountRs} (${reason})`,
      performedBy: 'superadmin'
    });

    await AdminAuditLog.create({
      adminUsername: 'superadmin',
      action: 'WALLET_MANUAL_ADJUSTMENT',
      targetEntity: `User:${user.username}`,
      targetId: user._id.toString(),
      details: `${actionType} ₹${amountRs} (${subBalanceType}). Reason: ${reason}`,
      diff: { subBalanceType, previousRs: previousBalance / 100, newRs: newBalance / 100 },
      ipAddress: clientIp,
      userAgent: req.headers.get('user-agent') || 'Unknown'
    });

    return NextResponse.json({
      status: true,
      message: `Successfully ${actionType.toLowerCase()}ed ₹${amountRs} on user ${user.username}`,
      data: {
        userId: user._id,
        username: user.username,
        updatedWallet: {
          depositBalanceRs: wallet.depositBalance / 100,
          winningBalanceRs: wallet.winningBalance / 100,
          bonusBalanceRs: wallet.bonusBalance / 100,
          totalBalanceRs: (wallet.depositBalance + wallet.winningBalance + wallet.bonusBalance) / 100
        }
      }
    });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
