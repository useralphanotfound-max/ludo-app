import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Match } from '@/lib/models/Match';
import { Room } from '@/lib/models/Room';
import { Wallet } from '@/lib/models/Wallet';
import { Transaction } from '@/lib/models/Transaction';
import { Dispute } from '@/lib/models/Dispute';
import { getAuthUser } from '@/lib/authHelper';
import { saveUploadedFile } from '@/lib/uploadHelper';
import mongoose from 'mongoose';

export async function POST(req) {
  try {
    await connectDB();
    let body = {};
    let uploadedScreenshot = null;

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      for (const [key, value] of formData.entries()) {
        if (value && typeof value === 'object' && value.name) {
          const saved = await saveUploadedFile(value, 'proofs');
          uploadedScreenshot = saved?.url || null;
        } else {
          body[key] = value;
        }
      }
    } else {
      body = await req.json().catch(() => ({}));
      const rawScreenshot = body.screenshotUrl || body.screenshot_url || body.screenshot;
      if (rawScreenshot && typeof rawScreenshot === 'string' && rawScreenshot.startsWith('data:')) {
        const saved = await saveUploadedFile(rawScreenshot, 'proofs');
        uploadedScreenshot = saved?.url || rawScreenshot;
      }
    }

    const matchId = body.matchId || body.match_id || body.roomId || body.room_id;
    let claimedResult = body.claimedResult || body.claimed_result || body.status || body.submitted_status;
    if (claimedResult) {
      claimedResult = String(claimedResult).toUpperCase().trim();
      if (claimedResult === 'WIN') claimedResult = 'WON';
      if (claimedResult === 'LOSS') claimedResult = 'LOST';
    }

    const screenshotUrl = uploadedScreenshot || body.screenshotUrl || body.screenshot_url || body.screenshot || '';
    let opponentClaimedResult = body.opponentClaimedResult || body.opponent_claimed_result;
    if (opponentClaimedResult) {
      opponentClaimedResult = String(opponentClaimedResult).toUpperCase().trim();
      if (opponentClaimedResult === 'WIN') opponentClaimedResult = 'WON';
      if (opponentClaimedResult === 'LOSS') opponentClaimedResult = 'LOST';
    }
    const bodyUserId = body.userId || body.user_id;

    if (!matchId || !claimedResult) {
      return NextResponse.json({
        success: false,
        status: false,
        message: 'Match ID / Room ID and claimed result (WON/LOST) required'
      }, { status: 400 });
    }

    let submittingUser = null;
    if (bodyUserId && mongoose.Types.ObjectId.isValid(bodyUserId)) {
      submittingUser = await User.findById(bodyUserId);
    }
    if (!submittingUser) {
      submittingUser = await getAuthUser(req);
    }

    let match = null;
    if (mongoose.Types.ObjectId.isValid(matchId)) {
      match = await Match.findOne({ $or: [{ _id: matchId }, { roomId: matchId }] });
    }
    if (!match) {
      match = await Match.findOne({ roomCode: matchId });
    }
    if (!match) {
      // Find room if match record doesn't exist yet
      let room = null;
      if (mongoose.Types.ObjectId.isValid(matchId)) {
        room = await Room.findById(matchId);
      }
      if (!room) {
        room = await Room.findOne({ roomCode: matchId });
      }
      if (room) {
        match = await Match.findOne({ roomId: room._id });
        if (!match) {
          const [cUser, oUser] = await Promise.all([
            User.findById(room.creatorId).lean().catch(() => null),
            room.opponentId ? User.findById(room.opponentId).lean().catch(() => null) : null
          ]);
          match = await Match.create({
            roomId: room._id,
            gameMode: 'CLASSIC',
            entryFee: room.entryFee,
            prizePool: room.prizePool,
            players: [
              { userId: room.creatorId, username: cUser?.username || 'Player 1', avatarUrl: cUser?.avatarUrl || '' },
              { userId: room.opponentId, username: oUser?.username || 'Player 2', avatarUrl: oUser?.avatarUrl || '' }
            ],
            status: 'ACTIVE'
          });
        }
      }
    }

    if (!match) {
      return NextResponse.json({
        success: false,
        status: false,
        message: 'Match or room not found'
      }, { status: 404 });
    }

    const p1 = match.players?.[0] || {};
    const p2 = match.players?.[1] || {};

    const isP2 = submittingUser && p2.userId && String(submittingUser._id) === String(p2.userId);
    const p1Name = p1.username || 'Player 1';
    const p2Name = p2.username || 'Player 2';

    let dispute = await Dispute.findOne({ matchId: match._id });
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
        winnerWallet.lockedBalance = Math.max(0, (winnerWallet.lockedBalance || 0) - match.entryFee);
        await winnerWallet.save();
      }

      if (loserWallet) {
        loserWallet.lockedBalance = Math.max(0, (loserWallet.lockedBalance || 0) - match.entryFee);
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
          description: `Match Victory! Prize Pool ₹${Math.round(match.prizePool)} credited.`
        }).catch(() => {});
      }

      return NextResponse.json({
        success: true,
        status: true,
        message: `Match auto-completed! ${winnerUsername} declared winner and awarded ₹${Math.round(match.prizePool)}. No dispute review needed.`,
        data: {
          match_id: match._id.toString(),
          room_id: match.roomId?.toString(),
          autoResolved: true,
          status: 'COMPLETED',
          result_status: 'COMPLETED',
          winnerUsername,
          winnerId: winnerUserId,
          prize_amount: Math.round(match.prizePool),
          prizePoolRs: Math.round(match.prizePool)
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
        success: true,
        status: true,
        message: 'Conflicting result claims (Both players claimed WON). Sent to Admin Panel for dispute review.',
        data: {
          match_id: match._id.toString(),
          room_id: match.roomId?.toString(),
          autoResolved: false,
          status: 'PENDING_ADMIN_REVIEW',
          result_status: 'UNDER_REVIEW',
          claimId: dispute._id.toString(),
          prize_amount: Math.round(match.prizePool)
        }
      });
    }

    // CASE C: Single claim recorded, waiting for opponent
    return NextResponse.json({
      success: true,
      status: true,
      message: 'Result submitted successfully. Under verification.',
      data: {
        match_id: match._id.toString(),
        room_id: match.roomId?.toString(),
        autoResolved: false,
        status: 'WAITING_OPPONENT',
        result_status: 'UNDER_REVIEW',
        claimId: dispute._id.toString(),
        prize_amount: Math.round(match.prizePool)
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      status: false,
      message: error.message
    }, { status: 500 });
  }
}
