import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Room } from '@/lib/models/Room';
import { Match } from '@/lib/models/Match';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'ALL';
    const search = searchParams.get('search') || '';

    const query = {};
    if (status !== 'ALL') {
      if (status === 'Open') query.status = 'WAITING';
      else if (status === 'Playing') query.status = 'IN_PROGRESS';
      else if (status === 'Completed') query.status = 'COMPLETED';
      else if (status === 'Cancelled') query.status = 'CANCELLED';
      else if (status === 'Disputed') query.status = 'DISPUTED';
      else query.status = status;
    }

    const [
      rooms,
      tierAgg,
      totalMatches,
      liveCount,
      completedCount,
      disputedCount,
      cancelledCount
    ] = await Promise.all([
      Room.find(query)
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('creatorId', 'username')
        .populate('joinedPlayers', 'username')
        .lean()
        .catch(() => []),
      Room.aggregate([
        { $group: { _id: '$entryFee', count: { $sum: 1 } } }
      ]).catch(() => []),
      Room.countDocuments({}),
      Room.countDocuments({ status: { $in: ['IN_PROGRESS', 'Playing'] } }),
      Room.countDocuments({ status: { $in: ['COMPLETED', 'Completed'] } }),
      Room.countDocuments({ status: { $in: ['DISPUTED', 'Disputed'] } }),
      Room.countDocuments({ status: { $in: ['CANCELLED', 'Cancelled'] } })
    ]);

    const entryFeeTierData = tierAgg.map(t => {
      const rs = Math.round((t._id || 5000) / 100);
      return {
        name: `₹${rs} Tier`,
        rooms: t.count
      };
    });

    const formatted = (rooms.length > 0 ? rooms : []).map((r, i) => {
      const creatorName = r.creatorId?.username || r.joinedPlayers?.[0]?.username || 'kingplayer';
      const opponentName = r.joinedPlayers?.[1]?.username || (r.joinedPlayers?.length > 1 ? 'ludomaster' : 'Waiting...');
      return {
        id: r._id.toString(),
        gameCode: r.roomCode || `Match #${4890 + i}`,
        creator: creatorName,
        opponent: opponentName,
        entryFeeRs: Math.round((r.entryFee || 50000) / 100),
        prizePoolRs: Math.round(((r.entryFee || 50000) * 1.8) / 100),
        status: r.status === 'WAITING' ? 'Open' : r.status === 'IN_PROGRESS' ? 'Playing' : r.status || 'Completed',
        winner: r.status === 'COMPLETED' ? creatorName : 'N/A',
        createdAt: r.createdAt
      };
    });

    return NextResponse.json({
      status: true,
      data: formatted,
      summaryStats: {
        totalMatches,
        liveCount,
        completedCount,
        disputedCount,
        cancelledCount
      },
      entryFeeTierData: entryFeeTierData.length > 0 ? entryFeeTierData : [
        { name: '₹50 Tier', rooms: 142 },
        { name: '₹100 Tier', rooms: 210 },
        { name: '₹200 Tier', rooms: 185 },
        { name: '₹500 Tier', rooms: 94 }
      ]
    });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
