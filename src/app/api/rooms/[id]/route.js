import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Room } from '@/lib/models/Room';
import { getAuthUser } from '@/lib/authHelper';

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

    const { id } = params;

    const room = await Room.findOne({
      $or: [{ _id: id }, { roomCode: id }]
    }).populate('creatorId', 'username avatarUrl level')
      .populate('joinedPlayers', 'username avatarUrl level');

    if (!room) {
      return NextResponse.json({
        success: false,
        error: { code: 'ROOM_NOT_FOUND', message: 'Room not found' }
      }, { status: 404 });
    }

    const players = (room.joinedPlayers || []).map((p, idx) => ({
      user_id: p._id,
      username: p.username,
      avatar_url: p.avatarUrl || 'https://cdn.royalludo.com/avatars/av1.png',
      level: p.level || 1,
      slot: idx + 1,
      is_host: p._id.toString() === room.creatorId?._id?.toString()
    }));

    while (players.length < 2) {
      players.push({
        slot: players.length + 1,
        is_empty: true,
        status: 'SEARCHING'
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        room_id: room._id,
        room_code: room.roomCode,
        game_mode: 'classic',
        player_count: 2,
        entry_fee: room.entryFee,
        prize_pool: room.prizePool,
        platform_commission: room.platformCommission || 10,
        status: room.status,
        players_joined: room.joinedPlayers?.length || 1,
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
