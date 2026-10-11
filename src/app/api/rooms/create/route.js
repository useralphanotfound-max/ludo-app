import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Room } from '@/lib/models/Room';
import { User } from '@/lib/models/User';
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
    const { entry_fee, entryFee, amount, bet_amount, fee: bodyFee, room_code, roomCode, is_private, isPrivate, player_count, playerCount } = body;

    const fee = Number(entry_fee || entryFee || amount || bet_amount || bodyFee);
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

    // Check if user already has an active IN_PROGRESS match
    const inProgressMatch = await Room.findOne({
      joinedPlayers: userPayload.userId, status: 'IN_PROGRESS'
    });

    if (inProgressMatch) {
      return NextResponse.json({
        success: false,
        error: { code: 'ACTIVE_ROOM_EXISTS', message: 'You already have an ongoing match.' }
      }, { status: 400 });
    }

    // Check if user already has 2 or more WAITING rooms
    const waitingRoomsCount = await Room.countDocuments({
      creatorId: userPayload.userId, status: 'WAITING', expiresAt: { $gt: new Date() }
    });

    if (waitingRoomsCount >= 2) {
      return NextResponse.json({
        success: false,
        error: { code: 'MAX_ROOMS_REACHED', message: 'You already have 2 active open challenges. Cancel or finish one first.' }
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

    const timeoutSeconds = settings.roomTimeoutSeconds || 180;
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

    const creatorUser = await User.findById(userPayload.userId).select('username avatarId avatarUrl').lean();

    return NextResponse.json({
      success: true,
      status: true,
      message: 'Room created successfully. Waiting for opponent.',
      data: {
        room_id: newRoom._id.toString(),
        room_code: newRoom.roomCode,
        game_mode: 'CLASSIC',
        player_count: newRoom.playerCount,
        entry_fee: newRoom.entryFee,
        prize_pool: newRoom.prizePool,
        platform_commission: newRoom.platformCommission,
        is_private: newRoom.isPrivate,
        status: 'WAITING',
        timer_seconds: timeoutSeconds,
        timeout_seconds: timeoutSeconds,
        creator: {
          id: creatorUser?._id?.toString() || userPayload.userId,
          username: creatorUser?.username || 'Player',
          avatar_id: creatorUser?.avatarId || 'av1',
          avatar_url: creatorUser?.avatarUrl || 'assets/images/avatars/avatar1.png'
        },
        opponent: null,
        expires_at: newRoom.expiresAt.toISOString(),
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
