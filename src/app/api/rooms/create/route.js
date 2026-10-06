import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Room } from '@/lib/models/Room';
import { GameSettings } from '@/lib/models/GameSettings';
import { debitWallet } from '@/lib/walletHelper';
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

export async function POST(req) {
  try {
    await connectDB();
    const userPayload = getUserFromToken(req);
    if (!userPayload) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication token required' }
      }, { status: 401 });
    }

    const body = await req.json();
    const { entry_fee, entryFee, room_code, roomCode, is_private, isPrivate, player_count, playerCount } = body;

    const fee = Number(entry_fee || entryFee);
    const targetPlayerCount = Number(player_count || playerCount) === 4 ? 4 : 2;

    if (!fee || fee < 10) {
      return NextResponse.json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Minimum room entry fee is ₹10' }
      }, { status: 400 });
    }

    // Fetch dynamic GameSettings
    let settings = await GameSettings.findOne({ key: 'global_settings' });
    if (!settings) {
      settings = await GameSettings.create({ key: 'global_settings' });
    }

    // Check if user already has an active WAITING room or ACTIVE match
    const existingActiveRoom = await Room.findOne({
      $or: [
        { creatorId: userPayload.userId, status: 'WAITING', expiresAt: { $gt: new Date() } },
        { joinedPlayers: userPayload.userId, status: 'IN_PROGRESS' }
      ]
    });

    if (existingActiveRoom) {
      return NextResponse.json({
        success: false,
        error: { code: 'ACTIVE_ROOM_EXISTS', message: 'You already have an active room or ongoing match.' }
      }, { status: 400 });
    }

    // Debit entry fee from creator wallet (Strict No Negative Balance)
    const refCodeStr = room_code || roomCode || Math.floor(100000 + Math.random() * 900000).toString();

    await debitWallet({
      userId: userPayload.userId,
      amount: fee,
      type: 'MATCH_ENTRY',
      subBalanceType: 'mixed',
      referenceId: refCodeStr,
      description: `Room Creation Entry Fee for Code #${refCodeStr}`
    });

    const commPct = settings.platformCommissionPct || 10;
    const grossPrize = fee * targetPlayerCount;
    const commission = (grossPrize * commPct) / 100;
    const netPrizePool = grossPrize - commission;

    const timeoutSeconds = settings.roomTimeoutSeconds || 45;
    const expiresAt = new Date(Date.now() + timeoutSeconds * 1000);

    const newRoom = await Room.create({
      creatorId: userPayload.userId,
      gameMode: 'CLASSIC',
      playerCount: targetPlayerCount,
      entryFee: fee,
      prizePool: netPrizePool,
      platformCommission: commission,
      roomCode: refCodeStr,
      isPrivate: Boolean(is_private || isPrivate),
      status: 'WAITING',
      joinedPlayers: [userPayload.userId],
      expiresAt
    });

    return NextResponse.json({
      success: true,
      status: true,
      message: 'Room created successfully. Waiting for players to join...',
      data: {
        room_id: newRoom._id.toString(),
        room_code: newRoom.roomCode,
        game_mode: 'CLASSIC',
        player_count: newRoom.playerCount,
        entry_fee: newRoom.entryFee,
        prize_pool: newRoom.prizePool,
        platform_commission: newRoom.platformCommission,
        is_private: newRoom.isPrivate,
        status: newRoom.status,
        expires_at: newRoom.expiresAt.toISOString(),
        timeout_seconds: timeoutSeconds,
        created_at: newRoom.createdAt.toISOString()
      }
    }, { status: 201 });

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
