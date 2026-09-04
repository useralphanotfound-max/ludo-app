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
    const { entry_fee, entryFee, room_code, roomCode, is_private, isPrivate } = body;

    const fee = Number(entry_fee || entryFee);
    if (!fee || fee <= 0) {
      return NextResponse.json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Valid entry fee is required' }
      }, { status: 400 });
    }

    // Fetch dynamic GameSettings
    let settings = await GameSettings.findOne({ key: 'global_settings' });
    if (!settings) {
      settings = await GameSettings.create({ key: 'global_settings' });
    }

    // Check if user already has an active WAITING room
    const existingActiveRoom = await Room.findOne({
      creatorId: userPayload.userId,
      status: 'WAITING',
      expiresAt: { $gt: new Date() }
    });

    if (existingActiveRoom) {
      return NextResponse.json({
        success: false,
        error: { code: 'ACTIVE_ROOM_EXISTS', message: 'You already have an active created room waiting for an opponent.' }
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
    const grossPrize = fee * 2;
    const commission = (grossPrize * commPct) / 100;
    const netPrizePool = grossPrize - commission;

    const timeoutSeconds = settings.roomTimeoutSeconds || 45;
    const expiresAt = new Date(Date.now() + timeoutSeconds * 1000);

    const newRoom = await Room.create({
      creatorId: userPayload.userId,
      gameMode: 'CLASSIC',
      playerCount: 2,
      entryFee: fee,
      prizePool: netPrizePool,
      platformCommission: commission,
      roomCode: refCodeStr,
      isPrivate: Boolean(is_private || isPrivate),
      status: 'WAITING',
      expiresAt
    });

    return NextResponse.json({
      success: true,
      message: 'Room created successfully. Waiting for an opponent to join...',
      data: {
        room_id: newRoom._id.toString(),
        room_code: newRoom.roomCode,
        game_mode: 'CLASSIC',
        player_count: 2,
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
