import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Match } from '@/lib/models/Match';
import { Room } from '@/lib/models/Room';
import { Wallet } from '@/lib/models/Wallet';
import { Transaction } from '@/lib/models/Transaction';
import { Dispute } from '@/lib/models/Dispute';
import { getAuthUser } from '@/lib/authHelper';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { matchId, claimedResult, screenshotUrl, opponentClaimedResult, userId: bodyUserId } = body;

    if (!matchId || !claimedResult) {
      return NextResponse.json({ status: false, message: 'Match ID and claimed result (WON/LOST) required' }, { status: 400 });
    }

    let submittingUser = null;
    if (bodyUserId) {
      submittingUser = await User.findById(bodyUserId);
    }
    if (!submittingUser) {
      submittingUser = await getAuthUser(req);
    }

    const match = await Match.findById(matchId);
    if (!match) return NextResponse.json({ status: false, message: 'Match not found' }, { status: 404 });

    const p1 = match.players?.[0] || {};
    const p2 = match.players?.[1] || {};

    const isP2 = submittingUser && p2.userId && String(submittingUser._id) === String(p2.userId);
    const p1Name = p1.username || 'Player 1';
    const p2Name = p2.username || 'Player 2';

    let dispute = await Dispute.findOne({ matchId });
    if (!dispute) {
      dispute = await Dispute.create({
        matchId: match._id,
        roomId: match.roomId,
        player1: {
          userId: p1.userId,
          username: p1Name,
          claimedResult: isP2 ? (opponentClaimedResult || 'NONE') : claimedResult,
          screenshotUrl: isP2 ? '' : (screenshotUrl || '/disputes/p1_win.png'),
          submittedAt: new Date()
        },
        player2: {
          userId: p2.userId,
          username: p2Name,
          claimedResult: isP2 ? claimedResult : (opponentClaimedResult || 'LOST'),
          screenshotUrl: isP2 ? (screenshotUrl || '/disputes/p2_win.png') : '',
          submittedAt: new Date()
        },
        status: 'PENDING_ADMIN_REVIEW'
      });
    } else {
      if (isP2) {
        dispute.player2.claimedResult = claimedResult;
        if (screenshotUrl) dispute.player2.screenshotUrl = screenshotUrl;
        dispute.player2.submittedAt = new Date();
      } else {
        dispute.player1.claimedResult = claimedResult;
        if (screenshotUrl) dispute.player1.screenshotUrl = screenshotUrl;
        dispute.player1.submittedAt = new Date();
      }
      if (opponentClaimedResult) {
        if (isP2) dispute.player1.claimedResult = opponentClaimedResult;
        else dispute.player2.claimedResult = opponentClaimedResult;
      }
      await dispute.save();
    }

    const c1 = dispute.player1.claimedResult;
    const c2 = dispute.player2.claimedResult;

    // CASE A: UNCONTESTED OUTCOME (One WON, One LOST) -> Instant Auto Resolution!
    const isP1Winner = (c1 === 'WON' && c2 === 'LOST');
    const isP2Winner = (c1 === 'LOST' && c2 === 'WON');

    if (isP1Winner || isP2Winner) {
      const winnerUserId = isP1Winner ? p1.userId : p2.userId;
      const winnerUsername = isP1Winner ? p1Name : p2Name;
      const loserUserId = isP1Winner ? p2.userId : p1.userId;

      // Disburse Funds
      const [winnerWallet, loserWallet] = await Promise.all([
        Wallet.findOne({ userId: winnerUserId }),
        Wallet.findOne({ userId: loserUserId })
      ]);

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

      if (match.roomId) {
        await Room.findByIdAndUpdate(match.roomId, { status: 'COMPLETED' }).catch(() => {});
      }

      dispute.status = isP1Winner ? 'RESOLVED_P1_WIN' : 'RESOLVED_P2_WIN';
      dispute.adminNotes = `Auto-Resolved: Uncontested match outcome (${winnerUsername} WON, opponent LOST). Funds disbursed.`;
      dispute.resolvedAt = new Date();
      await dispute.save();

      if (winnerUserId) {
        await Transaction.create({
          userId: winnerUserId,
          type: 'PRIZE_PAYOUT',
          amount: match.prizePool,
          subBalanceType: 'winning',
          status: 'SUCCESS',
          description: `Match Victory! Prize Pool ₹${Math.round(match.prizePool / 100)} credited.`
        }).catch(() => {});
      }

      return NextResponse.json({
        status: true,
        message: `Match auto-completed! ${winnerUsername} declared winner and awarded ₹${Math.round(match.prizePool / 100)}. No dispute review needed.`,
        data: {
          autoResolved: true,
          status: 'COMPLETED',
          winnerUsername,
          winnerId: winnerUserId,
          prizePoolRs: Math.round(match.prizePool / 100)
        }
      });
    }

    // CASE B: BOTH CLAIM WON -> CONFLICT! Needs Admin Panel Review
    if (c1 === 'WON' && c2 === 'WON') {
      match.status = 'DISPUTED';
      await match.save();
      dispute.status = 'PENDING_ADMIN_REVIEW';
      await dispute.save();

      return NextResponse.json({
        status: true,
        message: 'Conflicting result claims (Both players claimed WON). Sent to Admin Panel for dispute review.',
        data: {
          autoResolved: false,
          status: 'PENDING_ADMIN_REVIEW',
          claimId: dispute._id
        }
      });
    }

    // CASE C: Single claim recorded, waiting for opponent
    return NextResponse.json({
      status: true,
      message: 'Result recorded. Awaiting opponent result submission.',
      data: {
        autoResolved: false,
        status: 'WAITING_OPPONENT',
        claimId: dispute._id
      }
    });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
