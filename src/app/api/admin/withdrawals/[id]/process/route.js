import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { WithdrawalRequest } from '@/lib/models/WithdrawalRequest';
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
    const { action, reason } = body;
    const clientIp = getClientIp(req);

    const withdrawal = await WithdrawalRequest.findById(id);
    if (!withdrawal) return NextResponse.json({ status: false, message: 'Withdrawal request not found' }, { status: 404 });

    if (withdrawal.status !== 'PENDING_APPROVAL') {
      return NextResponse.json({ status: false, message: `Request is already ${withdrawal.status}` }, { status: 400 });
    }

    const wallet = await Wallet.findOne({ userId: withdrawal.userId });

    if (action === 'APPROVE') {
      withdrawal.status = 'APPROVED';
      withdrawal.processedBy = 'superadmin';
      withdrawal.processedAt = new Date();
      await withdrawal.save();

      if (wallet) {
        wallet.lockedBalance = Math.max(0, wallet.lockedBalance - withdrawal.amountPaise);
        await wallet.save();
      }

      await Transaction.create({
        userId: withdrawal.userId,
        type: 'WITHDRAWAL',
        amount: -withdrawal.amountPaise,
        status: 'SUCCESS',
        description: `Withdrawal approved (Payout ₹${withdrawal.amountPaise / 100} via ${withdrawal.payoutMethod})`,
        performedBy: 'superadmin'
      });

      await AdminAuditLog.create({
        adminUsername: 'superadmin',
        action: 'APPROVE_WITHDRAWAL',
        targetEntity: `Withdrawal:${withdrawal._id}`,
        targetId: withdrawal._id.toString(),
        details: `Approved payout of ₹${withdrawal.amountPaise / 100} for ${withdrawal.username}`,
        ipAddress: clientIp,
        userAgent: req.headers.get('user-agent') || 'Unknown'
      });

      return NextResponse.json({ status: true, message: `Withdrawal ₹${withdrawal.amountPaise / 100} approved successfully` });
    } else {
      withdrawal.status = 'REJECTED';
      withdrawal.rejectionReason = reason || 'Rejected by superadmin';
      withdrawal.processedBy = 'superadmin';
      withdrawal.processedAt = new Date();
      await withdrawal.save();

      if (wallet) {
        wallet.lockedBalance = Math.max(0, wallet.lockedBalance - withdrawal.amountPaise);
        wallet.winningBalance += withdrawal.amountPaise;
        await wallet.save();
      }

      await Transaction.create({
        userId: withdrawal.userId,
        type: 'REFUND',
        amount: withdrawal.amountPaise,
        status: 'SUCCESS',
        description: `Withdrawal rejected & refunded: ₹${withdrawal.amountPaise / 100} (${reason || 'Admin reject'})`,
        performedBy: 'superadmin'
      });

      await AdminAuditLog.create({
        adminUsername: 'superadmin',
        action: 'REJECT_WITHDRAWAL',
        targetEntity: `Withdrawal:${withdrawal._id}`,
        targetId: withdrawal._id.toString(),
        details: `Rejected payout of ₹${withdrawal.amountPaise / 100} for ${withdrawal.username}. Reason: ${reason || 'N/A'}`,
        ipAddress: clientIp,
        userAgent: req.headers.get('user-agent') || 'Unknown'
      });

      return NextResponse.json({ status: true, message: `Withdrawal rejected and ₹${withdrawal.amountPaise / 100} refunded to user winning wallet` });
    }
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
