import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Dispute } from '@/lib/models/Dispute';

import { Match } from '@/lib/models/Match';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const disputes = await Dispute.find()
      .populate('matchId')
      .sort({ createdAt: -1 })
      .lean();

    const formatted = disputes.map(d => {
      const match = d.matchId || {};
      const matchPlayers = match.players || [];
      
      const p1Name = d.player1?.username || matchPlayers[0]?.username || 'Player 1';
      const p2Name = d.player2?.username || matchPlayers[1]?.username || 'Player 2';
      const entryFeeRs = match.entryFee ? Math.round(match.entryFee / 100) : (d.entryFeeRs || 500);
      const prizePoolRs = match.prizePool ? Math.round(match.prizePool / 100) : (d.prizePoolRs || 900);

      return {
        ...d,
        id: d._id.toString(),
        matchId: match._id ? match._id.toString() : (d.matchId || 'Match #4892'),
        entryFeeRs,
        prizePoolRs,
        player1: {
          ...d.player1,
          username: p1Name,
          claimedResult: d.player1?.claimedResult || 'WON',
          screenshotUrl: d.player1?.screenshotUrl || '/disputes/p1_win.png',
          deviceIp: d.player1?.deviceIp || '103.22.89.14 (Mumbai, IN)'
        },
        player2: {
          ...d.player2,
          username: p2Name,
          claimedResult: d.player2?.claimedResult || 'LOST',
          screenshotUrl: d.player2?.screenshotUrl || '/disputes/p2_win.png',
          deviceIp: d.player2?.deviceIp || '157.33.12.90 (Delhi, IN)'
        }
      };
    });

    return NextResponse.json({ status: true, message: 'Disputes retrieved', data: formatted });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
