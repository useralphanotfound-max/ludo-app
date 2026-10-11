import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { WithdrawalRequest } from '@/lib/models/WithdrawalRequest';
import { Wallet } from '@/lib/models/Wallet';
import { Transaction } from '@/lib/models/Transaction';
import { AdminAuditLog } from '@/lib/models/AdminAuditLog';
import { getClientIp } from '@/lib/ipHelper';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function POST(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json({ status: false, message: 'Withdrawal ID required' }, { status: 400 });
    }

    const body = await req.json();
    const { action, reason } = body;
    const clientIp = getClientIp(req);

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { requestId: id }] };
    } else {
      query = { requestId: id };
    }

    const withdrawal = await WithdrawalRequest.findOne(query);
    if (!withdrawal) return NextResponse.json({ status: false, message: 'Withdrawal request not found' }, { status: 404 });

    if (withdrawal.status !== 'PENDING_APPROVAL') {
      return NextResponse.json({ status: false, message: `Request is already ${withdrawal.status}` }, { status: 400 });
    }

    const withdrawAmt = withdrawal.amount || (withdrawal.amountPaise ? withdrawal.amountPaise / 100 : 0);
    const wallet = await Wallet.findOne({ userId: withdrawal.userId });

    if (action === 'APPROVE') {
      withdrawal.status = 'APPROVED';
      withdrawal.processedBy = 'superadmin';
      withdrawal.processedAt = new Date();
      await withdrawal.save();

      if (wallet) {
        wallet.lockedBalance = Math.max(0, wallet.lockedBalance - withdrawAmt);
        await wallet.save();
      }

      await Transaction.create({
        userId: withdrawal.userId,
        type: 'WITHDRAWAL',
        amount: withdrawAmt,
        subBalanceType: 'winning',
        status: 'SUCCESS',
        description: `Withdrawal approved (Payout ₹${withdrawAmt} via ${withdrawal.payoutMethod || 'UPI'})`,
        performedBy: 'superadmin'
      }).catch(() => {});

      await AdminAuditLog.create({
        adminUsername: 'superadmin',
        action: 'APPROVE_WITHDRAWAL',
        targetEntity: `Withdrawal:${withdrawal._id}`,
        targetId: withdrawal._id.toString(),
        details: `Approved payout of ₹${withdrawAmt} for ${withdrawal.username || 'user'}`,
        ipAddress: clientIp,
        userAgent: req.headers.get('user-agent') || 'Unknown'
      }).catch(() => {});

      return NextResponse.json({ status: true, message: `Withdrawal ₹${withdrawAmt} approved successfully` });
    } else {
      withdrawal.status = 'REJECTED';
      withdrawal.rejectionReason = reason || 'Rejected by superadmin';
      withdrawal.processedBy = 'superadmin';
      withdrawal.processedAt = new Date();
      await withdrawal.save();

      if (wallet) {
        wallet.lockedBalance = Math.max(0, wallet.lockedBalance - withdrawAmt);
        wallet.winningBalance += withdrawAmt;
        await wallet.save();
      }

      await Transaction.create({
        userId: withdrawal.userId,
        type: 'REFUND',
        amount: withdrawAmt,
        subBalanceType: 'winning',
        status: 'SUCCESS',
        description: `Withdrawal rejected & refunded: ₹${withdrawAmt} (${reason || 'Admin reject'})`,
        performedBy: 'superadmin'
      }).catch(() => {});

      await AdminAuditLog.create({
        adminUsername: 'superadmin',
        action: 'REJECT_WITHDRAWAL',
        targetEntity: `Withdrawal:${withdrawal._id}`,
        targetId: withdrawal._id.toString(),
        details: `Rejected payout of ₹${withdrawAmt} for ${withdrawal.username || 'user'}. Reason: ${reason || 'N/A'}`,
        ipAddress: clientIp,
        userAgent: req.headers.get('user-agent') || 'Unknown'
      }).catch(() => {});

      return NextResponse.json({ status: true, message: `Withdrawal rejected and ₹${withdrawAmt} refunded to user winning wallet` });
    }
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
