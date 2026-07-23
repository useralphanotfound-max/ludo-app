import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Dispute } from '@/lib/models/Dispute';
import { Match } from '@/lib/models/Match';
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
    const { decision, adminNotes } = body;
    const clientIp = getClientIp(req);

    const dispute = await Dispute.findById(id);
    if (!dispute) return NextResponse.json({ status: false, message: 'Dispute record not found' }, { status: 404 });

    if (dispute.status !== 'PENDING_ADMIN_REVIEW') {
      return NextResponse.json({ status: false, message: 'Dispute is already resolved' }, { status: 400 });
    }

    const match = await Match.findById(dispute.matchId);
    if (!match) return NextResponse.json({ status: false, message: 'Associated match not found' }, { status: 404 });

    const p1UserId = dispute.player1.userId;
    const p2UserId = dispute.player2.userId;

    const p1Wallet = await Wallet.findOne({ userId: p1UserId });
    const p2Wallet = await Wallet.findOne({ userId: p2UserId });

    if (decision === 'P1_WIN' || decision === 'P2_WIN') {
      const winnerUserId = decision === 'P1_WIN' ? p1UserId : p2UserId;
      const loserUserId = decision === 'P1_WIN' ? p2UserId : p1UserId;
      const winnerUsername = decision === 'P1_WIN' ? dispute.player1.username : dispute.player2.username;

      const winnerWallet = decision === 'P1_WIN' ? p1Wallet : p2Wallet;
      const loserWallet = decision === 'P1_WIN' ? p2Wallet : p1Wallet;

      if (winnerWallet) {
        winnerWallet.winningBalance += match.prizePool;
        winnerWallet.lockedBalance = Math.max(0, winnerWallet.lockedBalance - match.entryFee);
        await winnerWallet.save();
      }

      if (loserWallet) {
        loserWallet.lockedBalance = Math.max(0, loserWallet.lockedBalance - match.entryFee);
        await loserWallet.save();
      }

      match.status = 'COMPLETED';
      match.winnerId = winnerUserId;
      match.resolvedAt = new Date();
      await match.save();

      dispute.status = decision === 'P1_WIN' ? 'RESOLVED_P1_WIN' : 'RESOLVED_P2_WIN';
      dispute.resolvedByAdminUsername = 'superadmin';
      dispute.adminNotes = adminNotes || `Declared ${winnerUsername} winner based on screenshot verification.`;
      dispute.resolvedAt = new Date();
      await dispute.save();

      await Transaction.create({
        userId: winnerUserId,
        type: 'MATCH_WIN',
        amount: match.prizePool,
        subBalanceType: 'winning',
        status: 'SUCCESS',
        description: `Dispute Won: Match Prize Pool ₹${match.prizePool / 100}`
      });

      await AdminAuditLog.create({
        adminUsername: 'superadmin',
        action: 'RESOLVE_DISPUTE',
        targetEntity: `Dispute:${dispute._id}`,
        targetId: dispute._id.toString(),
        details: `Resolved Dispute: Declared ${winnerUsername} winner (Prize ₹${match.prizePool / 100}). Notes: ${adminNotes || 'N/A'}`,
        ipAddress: clientIp,
        userAgent: req.headers.get('user-agent') || 'Unknown'
      });

      return NextResponse.json({ status: true, message: `Dispute resolved. ${winnerUsername} awarded ₹${match.prizePool / 100} winnings.` });
    } else {
      if (p1Wallet) {
        p1Wallet.winningBalance += match.entryFee;
        p1Wallet.lockedBalance = Math.max(0, p1Wallet.lockedBalance - match.entryFee);
        await p1Wallet.save();
      }
      if (p2Wallet) {
        p2Wallet.winningBalance += match.entryFee;
        p2Wallet.lockedBalance = Math.max(0, p2Wallet.lockedBalance - match.entryFee);
        await p2Wallet.save();
      }

      match.status = 'CANCELLED';
      match.resolvedAt = new Date();
      await match.save();

      dispute.status = 'REFUNDED';
      dispute.resolvedByAdminUsername = 'superadmin';
      dispute.adminNotes = adminNotes || 'Match cancelled and entry fees refunded to both players.';
      dispute.resolvedAt = new Date();
      await dispute.save();

      await AdminAuditLog.create({
        adminUsername: 'superadmin',
        action: 'RESOLVE_DISPUTE',
        targetEntity: `Dispute:${dispute._id}`,
        targetId: dispute._id.toString(),
        details: `Resolved Dispute: Refunded ₹${match.entryFee / 100} to both players. Notes: ${adminNotes || 'N/A'}`,
        ipAddress: clientIp,
        userAgent: req.headers.get('user-agent') || 'Unknown'
      });

      return NextResponse.json({ status: true, message: 'Dispute resolved. Both players refunded entry fees.' });
    }
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
