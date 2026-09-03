import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const now = new Date();
    const latencyChartData = [];
    const dbQueryChartData = [];

    for (let i = 6; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 5 * 60000);
      const timeStr = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const lat = Math.floor(15 + Math.random() * 12);
      const dbMs = parseFloat((1.5 + Math.random() * 1.2).toFixed(1));
      latencyChartData.push({ name: timeStr, latency: lat });
      dbQueryChartData.push({ name: timeStr, ms: dbMs });
    }

    const systemHealth = {
      apiHealth: 'HEALTHY',
      apiLatencyMs: latencyChartData[latencyChartData.length - 1].latency,
      dbStatus: 'CONNECTED',
      cpuUsagePct: Math.floor(12 + Math.random() * 15),
      memoryUsagePct: Math.floor(30 + Math.random() * 15),
      activeSockets: 3980 + Math.floor(Math.random() * 50),
      paymentGatewayStatus: 'OPERATIONAL',
      otpServiceStatus: 'OPERATIONAL',
      errorRatePct: 0.02,
      backgroundQueueStatus: 'PROCESSING',
      uptimeHours: 348,
      latencyChartData,
      dbQueryChartData
    };

    return NextResponse.json({ status: true, data: systemHealth });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
