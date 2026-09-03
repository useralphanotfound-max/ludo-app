import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const broadcastHistory = [
      {
        id: 'NOTIF-101',
        title: '🏆 Weekend Mega Tournament ₹100,000 Guarantee!',
        targetAudience: 'ALL_USERS',
        type: 'PUSH',
        sentCount: 28412,
        status: 'SENT',
        sentAt: new Date(Date.now() - 7200000)
      },
      {
        id: 'NOTIF-102',
        title: '⚡ Instant UPI Withdrawals Live Now',
        targetAudience: 'ACTIVE_PLAYERS',
        type: 'IN_APP',
        sentCount: 14200,
        status: 'SENT',
        sentAt: new Date(Date.now() - 86400000)
      },
      {
        id: 'NOTIF-103',
        title: '⚠️ Scheduled Maintenance Notice (2:00 AM - 3:00 AM)',
        targetAudience: 'ALL_USERS',
        type: 'ANNOUNCEMENT',
        sentCount: 28412,
        status: 'SCHEDULED',
        sentAt: new Date(Date.now() + 36000000)
      }
    ];

    return NextResponse.json({ status: true, data: broadcastHistory });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    return NextResponse.json({
      status: true,
      message: `Notification broadcast dispatched to ${body.targetAudience || 'ALL_USERS'} audience.`,
      data: body
    });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
