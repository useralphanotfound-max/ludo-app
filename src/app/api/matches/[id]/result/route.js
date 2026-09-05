import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Match } from '@/lib/models/Match';
import { Room } from '@/lib/models/Room';
import { creditWallet } from '@/lib/walletHelper';
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

export async function POST(req, { params }) {
  try {
    await connectDB();
    const userPayload = getUserFromToken(req);
    if (!userPayload) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication token required' }
      }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { is_winner, isWinner } = body;

    const claimWinner = Boolean(is_winner ?? isWinner);

    let match = await Match.findOne({ $or: [{ _id: id }, { roomId: id }, { roomCode: id }] });
    if (!match) {
      // Find room if match record doesn't exist yet
      const room = await Room.findById(id);
      if (!room) {
        return NextResponse.json({
          success: false,
          error: { code: 'MATCH_NOT_FOUND', message: 'Match or room record not found' }
        }, { status: 404 });
      }

      match = await Match.create({
        matchId: `match_${room.roomCode}_${Date.now()}`,
        roomId: room._id,
        roomCode: room.roomCode,
        gameMode: 'CLASSIC',
        entryFee: room.entryFee,
        prizePool: room.prizePool,
        platformCommission: room.platformCommission,
        players: [room.creatorId, room.opponentId],
        status: 'IN_PROGRESS'
      });
    }

    // Check if player already submitted result
    const existingSubmission = match.results?.find(r => r.userId?.toString() === userPayload.userId);
    if (existingSubmission) {
      return NextResponse.json({
        success: false,
        error: { code: 'RESULT_ALREADY_SUBMITTED', message: 'You have already submitted your match result for this game.' }
      }, { status: 409 });
    }

    if (!match.results) match.results = [];

    match.results.push({
      userId: userPayload.userId,
      isWinner: claimWinner,
      submittedAt: new Date()
    });

    // Check consensus if both players submitted
    if (match.results.length >= 2) {
      const winnerClaim = match.results.find(r => r.isWinner);
      const loserClaim = match.results.find(r => !r.isWinner);

      if (winnerClaim && loserClaim) {
        // Consensus reached! Single winner claim + single loser claim
        match.winnerId = winnerClaim.userId;
        match.status = 'COMPLETED';
        await match.save();

        // Credit prize pool to winner's winning balance!
        await creditWallet({
          userId: winnerClaim.userId,
          amount: match.prizePool,
          type: 'MATCH_WIN',
          subBalanceType: 'winning',
          referenceId: match.roomCode,
          description: `Winnings for Match #${match.roomCode}`
        });

        // Update Room status
        await Room.findByIdAndUpdate(match.roomId, { status: 'COMPLETED' });

      } else {
        // Disputed! Both claimed win or both claimed loss
        match.status = 'DISPUTED';
        await match.save();
      }
    } else {
      match.status = 'PENDING_VERIFICATION';
      await match.save();
    }

    return NextResponse.json({
      success: true,
      message: claimWinner
        ? 'Winning result claim submitted. Please upload your winning screenshot proof.'
        : 'Match result submitted.',
      data: {
        match_id: match.matchId,
        room_code: match.roomCode,
        is_winner: claimWinner,
        status: match.status,
        prize_amount: claimWinner ? match.prizePool : 0,
        submitted_at: new Date().toISOString()
      }
    }, { status: 200 });


  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}

export async function GET(req, { params }) {
  try {
    await connectDB();
    const userPayload = getUserFromToken(req);
    if (!userPayload) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication token required' }
      }, { status: 401 });
    }

    const { id } = params;

    const match = await Match.findOne({
      $or: [{ _id: id }, { roomId: id }, { roomCode: id }]
    });

    if (!match) {
      return NextResponse.json({
        success: false,
        error: { code: 'MATCH_NOT_FOUND', message: 'Match result not found' }
      }, { status: 404 });
    }

    const currentUserId = userPayload.userId || userPayload.id;
    const isWinner = match.winnerId?.toString() === currentUserId;
    const resultSubmission = match.results?.find(r => r.userId?.toString() === currentUserId);

    return NextResponse.json({
      success: true,
      data: {
        match_id: match.matchId || match._id,
        room_id: match.roomId,
        result_id: resultSubmission?._id || `res_${match._id.toString().slice(-6)}`,
        is_winner: isWinner,
        prize_amount: isWinner ? match.prizePool : 0,
        status: match.status === 'COMPLETED' ? 'VERIFIED' : match.status,
        screenshot_url: resultSubmission?.screenshotUrl || null,
        verified_at: match.resolvedAt || match.updatedAt,
        new_balance: null
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}

