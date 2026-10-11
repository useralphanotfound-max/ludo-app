import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Room } from '@/lib/models/Room';
import { Match } from '@/lib/models/Match';
import { User } from '@/lib/models/User';
import { debitWallet, refundWallet } from '@/lib/walletHelper';
import { getAuthUser } from '@/lib/authHelper';
import mongoose from 'mongoose';

export async function POST(req, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({
        success: false,
        status: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = resolvedParams?.id;

    const body = await req.json().catch(() => ({}));
    const { room_code, roomCode } = body;

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { roomCode: id }] };
    } else {
      query = { roomCode: id };
    }

    const room = await Room.findOne(query);
    if (!room) {
      return NextResponse.json({
        success: false,
        status: false,
        error: { code: 'ROOM_NOT_FOUND', message: 'Room does not exist' }
      }, { status: 404 });
    }

    // Check expiry
    if (room.expiresAt && new Date() >= new Date(room.expiresAt) && room.status === 'WAITING') {
      room.status = 'EXPIRED';
      room.refundedAt = new Date();
      await room.save();
      await refundWallet({
        userId: room.creatorId,
        amount: room.entryFee,
        referenceId: room.roomCode,
        description: `Auto-refund for expired Room #${room.roomCode}`
      }).catch((e) => console.error('Join auto-refund error:', e));

      return NextResponse.json({
        success: false,
        status: false,
        error: { code: 'ROOM_EXPIRED', message: 'This room has expired because the waiting timer elapsed.' }
      }, { status: 400 });
    }

    if (room.status !== 'WAITING') {
      return NextResponse.json({
        success: false,
        status: false,
        error: { code: 'ROOM_FULL', message: 'This room is no longer waiting for players.' }
      }, { status: 400 });
    }

    if (room.creatorId.toString() === user._id.toString()) {
      return NextResponse.json({
        success: false,
        status: false,
        error: { code: 'CANNOT_JOIN_OWN_ROOM', message: 'You cannot join your own created room.' }
      }, { status: 400 });
    }

    if (room.isPrivate) {
      const inputCode = room_code || roomCode;
      if (inputCode && inputCode !== room.roomCode) {
        return NextResponse.json({
          success: false,
          status: false,
          error: { code: 'INVALID_ROOM_CODE', message: 'The private room code entered is incorrect.' }
        }, { status: 400 });
      }
    }

    // Debit opponent's wallet balance
    await debitWallet({
      userId: user._id,
      amount: room.entryFee,
      type: 'MATCH_ENTRY',
      subBalanceType: 'mixed',
      referenceId: room.roomCode,
      description: `Room Join Entry Fee for Code #${room.roomCode}`
    });

    room.opponentId = user._id;
    room.joinedPlayers = [room.creatorId, user._id];
    room.status = 'MATCHED';
    await room.save();

    const [creatorUser, opponentUser] = await Promise.all([
      User.findById(room.creatorId).select('username avatarUrl').lean(),
      User.findById(user._id).select('username avatarUrl').lean()
    ]);

    // Create Match record
    let match = await Match.findOne({ roomId: room._id });
    if (!match) {
      match = await Match.create({
        roomId: room._id,
        gameMode: room.gameMode || 'CLASSIC',
        entryFee: room.entryFee,
        prizePool: room.prizePool,
        players: [
          { userId: room.creatorId, username: creatorUser?.username || 'Player 1', avatarUrl: creatorUser?.avatarUrl || '' },
          { userId: user._id, username: opponentUser?.username || 'Player 2', avatarUrl: opponentUser?.avatarUrl || '' }
        ],
        status: 'ACTIVE',
        startedAt: new Date()
      });
    }

    return NextResponse.json({
      success: true,
      status: true,
      message: 'Joined room successfully! Open Ludo King app using the Room Code.',
      data: {
        room_id: room._id.toString(),
        roomId: room._id.toString(),
        room_code: room.roomCode,
        roomCode: room.roomCode,
        match_id: match._id.toString(),
        matchId: match._id.toString(),
        entry_fee: room.entryFee,
        prize_pool: room.prizePool,
        status: 'MATCHED',
        creator: {
          id: creatorUser?._id?.toString() || room.creatorId.toString(),
          username: creatorUser?.username || 'HostPlayer',
          avatar_url: creatorUser?.avatarUrl || ''
        },
        opponent: {
          id: user._id.toString(),
          username: opponentUser?.username || 'OpponentPlayer',
          avatar_url: opponentUser?.avatarUrl || ''
        },
        ludo_king_app_url: 'ludoking://play'
      }
    }, { status: 200 });

  } catch (error) {
    if (error.code === 'INSUFFICIENT_BALANCE') {
      return NextResponse.json({
        success: false,
        status: false,
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
      status: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
