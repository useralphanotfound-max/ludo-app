import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AdminAuditLog } from '@/lib/models/AdminAuditLog';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const logs = await AdminAuditLog.find().sort({ createdAt: -1 }).limit(100).lean();
    return NextResponse.json({ status: true, message: 'Audit logs retrieved', data: logs });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
