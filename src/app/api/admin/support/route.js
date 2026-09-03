import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const tickets = [
      {
        id: 'TICKET-901',
        user: 'kingplayer',
        category: 'WITHDRAWAL_DELAY',
        priority: 'HIGH',
        status: 'In Progress',
        subject: 'UPI Withdrawal pending for 15 minutes',
        description: 'I initiated withdrawal of ₹500 via PhonePe but haven\'t received bank credit yet.',
        createdAt: new Date(Date.now() - 900000)
      },
      {
        id: 'TICKET-884',
        user: 'ludomaster',
        category: 'GAME_DISPUTE',
        priority: 'MEDIUM',
        status: 'Open',
        subject: 'Opponent disconnected near home triangle',
        description: 'Player disconnected at turn 34 right before I landed on final home square.',
        createdAt: new Date(Date.now() - 3600000)
      },
      {
        id: 'TICKET-712',
        user: 'priya_nair',
        category: 'KYC_VERIFICATION',
        priority: 'LOW',
        status: 'Resolved',
        subject: 'Aadhaar document re-upload request',
        description: 'Requested verification status update after uploading clear front/back photo.',
        createdAt: new Date(Date.now() - 86400000)
      }
    ];

    return NextResponse.json({ status: true, data: tickets });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
