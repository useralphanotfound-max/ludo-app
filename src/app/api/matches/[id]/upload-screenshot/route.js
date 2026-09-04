import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Match } from '@/lib/models/Match';
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

export async function POST(req, { params }) {
  try {
    await connectDB();
    const userPayload = getUserFromToken(req);
    if (!userPayload) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication token required' }
      }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const screenshotUrl = body.screenshot_url || body.screenshotUrl || 'https://cdn.royalludo.com/results/sample_win_proof.png';

    let match = await Match.findOne({ $or: [{ _id: id }, { roomId: id }, { roomCode: id }] });
    if (!match) {
      return NextResponse.json({
        success: false,
        error: { code: 'MATCH_NOT_FOUND', message: 'Match not found' }
      }, { status: 404 });
    }

    const resultSub = match.results?.find(r => r.userId?.toString() === userPayload.userId);
    if (resultSub) {
      resultSub.screenshotUrl = screenshotUrl;
    } else {
      match.results.push({
        userId: userPayload.userId,
        isWinner: true,
        screenshotUrl,
        submittedAt: new Date()
      });
    }

    await match.save();

    return NextResponse.json({
      success: true,
      message: 'Screenshot uploaded successfully. Result is pending verification.',
      data: {
        match_id: match.matchId,
        screenshot_url: screenshotUrl,
        status: match.status
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
