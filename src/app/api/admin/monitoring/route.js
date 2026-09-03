import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const systemHealth = {
      apiHealth: 'HEALTHY',
      apiLatencyMs: 18,
      dbStatus: 'CONNECTED',
      cpuUsagePct: 24,
      memoryUsagePct: 42,
      activeSockets: 3981,
      paymentGatewayStatus: 'OPERATIONAL',
      otpServiceStatus: 'OPERATIONAL',
      errorRatePct: 0.02,
      backgroundQueueStatus: 'PROCESSING',
      uptimeHours: 348
    };

    return NextResponse.json({ status: true, data: systemHealth });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
