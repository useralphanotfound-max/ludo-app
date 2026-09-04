import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Deposit } from '@/lib/models/Deposit';
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
    const { deposit_id, depositId, utr_number, utrNumber, transaction_id } = body;

    const depId = deposit_id || depositId;
    const cleanUtr = (utr_number || utrNumber || transaction_id || '').toString().trim();

    if (!depId) {
      return NextResponse.json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Deposit ID is required' }
      }, { status: 400 });
    }

    if (!cleanUtr || cleanUtr.length < 6) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_UTR', message: 'Please enter a valid UTR / UPI Transaction ID (minimum 6 digits)' }
      }, { status: 400 });
    }

    const deposit = await Deposit.findOne({ depositId: depId });
    if (!deposit) {
      return NextResponse.json({
        success: false,
        error: { code: 'DEPOSIT_NOT_FOUND', message: 'Deposit request not found' }
      }, { status: 404 });
    }

    if (deposit.userId.toString() !== userPayload.userId) {
      return NextResponse.json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied' }
      }, { status: 403 });
    }

    const now = new Date();
    if (now > new Date(deposit.expiresAt) && deposit.status === 'INITIATED') {
      deposit.status = 'EXPIRED';
      await deposit.save();

      return NextResponse.json({
        success: false,
        error: { code: 'DEPOSIT_EXPIRED', message: 'The 10-minute deposit window has expired. Please initiate a new deposit request.' }
      }, { status: 400 });
    }

    if (deposit.status === 'PENDING_APPROVAL' || deposit.status === 'APPROVED') {
      return NextResponse.json({
        success: false,
        error: { code: 'ALREADY_SUBMITTED', message: 'UTR for this deposit request has already been submitted.' }
      }, { status: 400 });
    }

    // Check if UTR has already been submitted in another deposit
    const existingUtr = await Deposit.findOne({
      utrNumber: cleanUtr,
      status: { $in: ['PENDING_APPROVAL', 'APPROVED'] }
    });

    if (existingUtr) {
      return NextResponse.json({
        success: false,
        error: { code: 'DUPLICATE_UTR', message: 'This UTR / Transaction ID has already been submitted for verification.' }
      }, { status: 400 });
    }

    deposit.utrNumber = cleanUtr;
    deposit.status = 'PENDING_APPROVAL';
    await deposit.save();

    return NextResponse.json({
      success: true,
      message: 'UTR submitted successfully! Your deposit is currently pending Admin verification and will be credited upon approval.',
      data: {
        deposit_id: deposit.depositId,
        utr_number: deposit.utrNumber,
        amount: deposit.amount,
        status: 'PENDING_APPROVAL',
        submitted_at: deposit.updatedAt.toISOString()
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
