import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Match } from '@/lib/models/Match';
import { Dispute } from '@/lib/models/Dispute';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { matchId, claimedResult, screenshotUrl } = body;

    if (!matchId || !claimedResult || !screenshotUrl) {
      return NextResponse.json({ status: false, message: 'Match ID, claimed result (WON/LOST), and screenshot URL required' }, { status: 400 });
    }

    const match = await Match.findById(matchId);
    if (!match) return NextResponse.json({ status: false, message: 'Match not found' }, { status: 404 });

    let dispute = await Dispute.findOne({ matchId });
    if (!dispute) {
      dispute = await Dispute.create({
        matchId: match._id,
        roomId: match.roomId,
        player1: {
          claimedResult,
          screenshotUrl,
          submittedAt: new Date()
        },
        status: 'PENDING_ADMIN_REVIEW'
      });
    } else {
      dispute.player2 = {
        claimedResult,
        screenshotUrl,
        submittedAt: new Date()
      };
      dispute.status = 'PENDING_ADMIN_REVIEW';
      await dispute.save();
    }

    match.status = 'DISPUTED';
    await match.save();

    return NextResponse.json({
      status: true,
      message: 'Match result submitted successfully. Pending screenshot verification.',
      data: {
        claimId: dispute._id,
        status: 'PENDING_ADMIN_REVIEW'
      }
    });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
