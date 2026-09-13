import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Room } from '@/lib/models/Room';
import { Match } from '@/lib/models/Match';
import { getAuthUser } from '@/lib/authHelper';
import { refundWallet } from '@/lib/walletHelper';
import mongoose from 'mongoose';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      }, { status: 401 });
    }

    const { id } = await params;

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { roomCode: id }] };
    } else {
      query = { roomCode: id };
    }

    const room = await Room.findOne(query)
      .populate('creatorId', 'username avatarId avatarUrl level mobile')
      .populate('joinedPlayers', 'username avatarId avatarUrl level mobile');

    if (!room) {
      return NextResponse.json({
        success: false,
        error: { code: 'ROOM_NOT_FOUND', message: 'Room not found' }
      }, { status: 404 });
    }

    const players = (room.joinedPlayers || []).map((p, idx) => ({
      user_id: p._id.toString(),
      username: p.username,
      avatar_id: p.avatarId || 'av1',
      avatar_url: p.avatarUrl || 'https://cdn.royalludo.com/avatars/av1.png',
      level: p.level || 1,
      slot: idx + 1,
      is_host: p._id.toString() === room.creatorId?._id?.toString()
    }));

    // Find opponent details if any
    const opponent = (room.joinedPlayers || []).find(
      p => p._id.toString() !== room.creatorId?._id?.toString()
    );

    const match = await Match.findOne({ roomId: room._id }).lean();

    return NextResponse.json({
      success: true,
      status: true,
      data: {
        room_id: room._id.toString(),
        room_code: room.roomCode,
        ludo_king_code: room.ludoKingCode || room.roomCode,
        is_code_shared: room.isCodeShared || !!room.ludoKingCode,
        game_mode: (room.gameMode || 'CLASSIC').toLowerCase(),
        player_count: room.playerCount || 2,
        entry_fee: room.entryFee,
        prize_pool: room.prizePool,
        platform_commission: room.platformCommission || 10,
        status: room.status,
        players_joined: room.joinedPlayers?.length || 1,
        creator: {
          id: room.creatorId?._id?.toString(),
          username: room.creatorId?.username,
          avatar_id: room.creatorId?.avatarId || 'av1',
          avatar_url: room.creatorId?.avatarUrl
        },
        opponent: opponent ? {
          id: opponent._id.toString(),
          username: opponent.username,
          avatar_id: opponent.avatarId || 'av1',
          avatar_url: opponent.avatarUrl
        } : null,
        match_id: match ? match._id.toString() : null,
        players,
        created_at: room.createdAt
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { ludo_king_code, ludoKingCode, room_code, roomCode } = body;

    const targetCode = ludo_king_code || ludoKingCode || room_code || roomCode;
    if (!targetCode) {
      return NextResponse.json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Ludo King Room Code is required' }
      }, { status: 400 });
    }

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
        error: { code: 'ROOM_NOT_FOUND', message: 'Room not found' }
      }, { status: 404 });
    }

    if (room.creatorId.toString() !== user._id.toString()) {
      return NextResponse.json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only the room creator can share the Ludo King Code' }
      }, { status: 403 });
    }

    room.ludoKingCode = targetCode.toString().trim();
    room.isCodeShared = true;
    if (['WAITING', 'JOINED', 'MATCHED'].includes(room.status)) {
      room.status = 'PLAYING';
    }
    await room.save();

    return NextResponse.json({
      success: true,
      status: true,
      message: 'Ludo King Room Code shared successfully with opponent.',
      data: {
        room_id: room._id.toString(),
        room_code: room.roomCode,
        ludo_king_code: room.ludoKingCode,
        is_code_shared: true,
        status: room.status
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      }, { status: 401 });
    }

    const { id } = await params;

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
        error: { code: 'ROOM_NOT_FOUND', message: 'Room not found' }
      }, { status: 404 });
    }

    if (room.creatorId.toString() !== user._id.toString()) {
      return NextResponse.json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only the room host can cancel this room.' }
      }, { status: 403 });
    }

    if (!['WAITING', 'JOINED'].includes(room.status)) {
      return NextResponse.json({
        success: false,
        error: { code: 'CANNOT_CANCEL', message: `Cannot cancel room with status ${room.status}` }
      }, { status: 400 });
    }

    room.status = 'CANCELLED';
    room.refundedAt = new Date();
    await room.save();

    const refundResult = await refundWallet({
      userId: room.creatorId,
      amount: room.entryFee,
      referenceId: room.roomCode,
      description: `Host cancelled Room #${room.roomCode}`
    });

    return NextResponse.json({
      success: true,
      status: true,
      message: `Room cancelled successfully. Entry fee of ₹${room.entryFee} refunded to wallet.`,
      data: {
        room_id: room._id.toString(),
        refunded_amount: room.entryFee,
        new_balance: (refundResult.wallet.depositBalance || 0) + (refundResult.wallet.winningBalance || 0) + (refundResult.wallet.bonusBalance || 0),
        status: 'CANCELLED'
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
