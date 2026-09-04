import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Room } from '@/lib/models/Room';
import { Match } from '@/lib/models/Match';
import { debitWallet, refundWallet } from '@/lib/walletHelper';
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
    const body = await req.json().catch(() => ({}));
    const { room_code, roomCode } = body;

    const room = await Room.findById(id);
    if (!room) {
      return NextResponse.json({
        success: false,
        error: { code: 'ROOM_NOT_FOUND', message: 'Room does not exist' }
      }, { status: 404 });
    }

    // Check expiry
    if (new Date() >= new Date(room.expiresAt) && room.status === 'WAITING') {
      room.status = 'EXPIRED';
      room.refundedAt = new Date();
      await room.save();
      await refundWallet({
        userId: room.creatorId,
        amount: room.entryFee,
        referenceId: room.roomCode,
        description: `Auto-refund for expired Room #${room.roomCode}`
      });

      return NextResponse.json({
        success: false,
        error: { code: 'ROOM_EXPIRED', message: 'This room has expired because 45 seconds timer elapsed.' }
      }, { status: 400 });
    }

    if (room.status !== 'WAITING') {
      return NextResponse.json({
        success: false,
        error: { code: 'ROOM_FULL', message: 'This room is no longer waiting for players.' }
      }, { status: 400 });
    }

    if (room.creatorId.toString() === userPayload.userId) {
      return NextResponse.json({
        success: false,
        error: { code: 'CANNOT_JOIN_OWN_ROOM', message: 'You cannot join your own created room.' }
      }, { status: 400 });
    }

    if (room.isPrivate) {
      const inputCode = room_code || roomCode;
      if (inputCode !== room.roomCode) {
        return NextResponse.json({
          success: false,
          error: { code: 'INVALID_ROOM_CODE', message: 'The private room code entered is incorrect.' }
        }, { status: 400 });
      }
    }

    // Debit opponent's wallet balance
    await debitWallet({
      userId: userPayload.userId,
      amount: room.entryFee,
      type: 'MATCH_ENTRY',
      subBalanceType: 'mixed',
      referenceId: room.roomCode,
      description: `Room Join Entry Fee for Code #${room.roomCode}`
    });

    room.opponentId = userPayload.userId;
    room.joinedPlayers = [room.creatorId, userPayload.userId];
    room.status = 'MATCHED';
    await room.save();

    // Create Match record
    const match = await Match.create({
      matchId: `match_${room.roomCode}_${Date.now()}`,
      roomId: room._id,
      roomCode: room.roomCode,
      gameMode: 'CLASSIC',
      entryFee: room.entryFee,
      prizePool: room.prizePool,
      platformCommission: room.platformCommission,
      players: [room.creatorId, userPayload.userId],
      status: 'IN_PROGRESS'
    });

    return NextResponse.json({
      success: true,
      message: 'Joined room successfully! Open Ludo King app using the Room Code.',
      data: {
        room_id: room._id.toString(),
        room_code: room.roomCode,
        match_id: match.matchId,
        entry_fee: room.entryFee,
        prize_pool: room.prizePool,
        status: 'MATCHED',
        ludo_king_app_url: 'ludoking://play'
      }
    }, { status: 200 });

  } catch (error) {
    if (error.code === 'INSUFFICIENT_BALANCE') {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INSUFFICIENT_BALANCE',
          message: error.message,
          available_balance: error.availableBalance,
          required_amount: error.requiredAmount
        }
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
