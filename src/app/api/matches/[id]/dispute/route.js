import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Match } from '@/lib/models/Match';
import { Dispute } from '@/lib/models/Dispute';
import { getAuthUser } from '@/lib/authHelper';
import mongoose from 'mongoose';

export async function POST(req, { params }) {
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
    const { reason, screenshot_url, screenshotUrl, screenshot } = body;

    const targetReason = reason || 'Player disputed match result';
    const targetScreenshot = screenshot_url || screenshotUrl || screenshot || '';

    let query = {};
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { roomId: id };
    }

    const match = await Match.findOne(query);
    if (!match) {
      return NextResponse.json({
        success: false,
        error: { code: 'MATCH_NOT_FOUND', message: 'Match not found' }
      }, { status: 404 });
    }

    match.status = 'DISPUTED';
    await match.save();

    let dispute = await Dispute.findOne({ matchId: match._id });
    if (!dispute) {
      dispute = new Dispute({
        matchId: match._id,
        roomId: match.roomId,
        reportingUserId: user._id,
        reason: targetReason,
        player1: {
          userId: user._id,
          username: user.username,
          claimedResult: 'DISPUTED',
          screenshotUrl: targetScreenshot,
          submittedAt: new Date()
        },
        status: 'PENDING_ADMIN_REVIEW'
      });
    } else {
      dispute.reason = targetReason;
      dispute.reportingUserId = user._id;
      if (!dispute.player2?.userId) {
        dispute.player2 = {
          userId: user._id,
          username: user.username,
          claimedResult: 'DISPUTED',
          screenshotUrl: targetScreenshot,
          submittedAt: new Date()
        };
      }
      dispute.status = 'PENDING_ADMIN_REVIEW';
    }

    await dispute.save();

    return NextResponse.json({
      success: true,
      status: true,
      message: 'Dispute submitted successfully. Admin review initiated.',
      data: {
        dispute_id: dispute._id.toString(),
        match_id: match._id.toString(),
        status: dispute.status,
        reason: dispute.reason,
        screenshot_url: targetScreenshot,
        submitted_at: dispute.updatedAt
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
