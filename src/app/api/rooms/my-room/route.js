import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Room } from '@/lib/models/Room';
import { getAuthUser } from '@/lib/authHelper';

export async function GET(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      }, { status: 401 });
    }

    const activeRoom = await Room.findOne({
      $or: [
        { creatorId: user._id },
        { opponentId: user._id },
        { joinedPlayers: user._id }
      ],
      status: { $in: ['WAITING', 'MATCHED', 'IN_PROGRESS'] }
    }).populate('creatorId', 'username avatarUrl level')
      .populate('opponentId', 'username avatarUrl level')
      .populate('joinedPlayers', 'username avatarUrl level');

    if (!activeRoom) {
      return NextResponse.json({
        success: true,
        data: null
      }, { status: 200 });
    }

    const players = (activeRoom.joinedPlayers || []).map((p, idx) => ({
      user_id: p._id,
      username: p.username,
      avatar_url: p.avatarUrl || 'https://cdn.royalludo.com/avatars/av1.png',
      level: p.level || 1,
      slot: idx + 1,
      is_host: p._id.toString() === activeRoom.creatorId?._id?.toString()
    }));

    // Fill remaining empty slots up to 2
    while (players.length < 2) {
      players.push({
        slot: players.length + 1,
        is_empty: true
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        room_id: activeRoom._id,
        room_code: activeRoom.roomCode,
        game_mode: 'classic',
        player_count: 2,
        entry_fee: activeRoom.entryFee,
        prize_pool: activeRoom.prizePool,
        status: activeRoom.status,
        players_joined: activeRoom.joinedPlayers?.length || 1,
        players,
        created_at: activeRoom.createdAt
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
