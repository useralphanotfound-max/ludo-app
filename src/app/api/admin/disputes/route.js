import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Dispute } from '@/lib/models/Dispute';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const disputes = await Dispute.find().sort({ createdAt: -1 });
    return NextResponse.json({ status: true, message: 'Disputes retrieved', data: disputes });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
