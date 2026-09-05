import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();
    const rawDoc = await mongoose.connection.db.collection('gamesettings').findOne({});
    const isEnabled = rawDoc ? rawDoc.isWebGameEnabled !== false : true;
    return NextResponse.json({ success: true, isWebGameEnabled: isEnabled });
  } catch (error) {
    return NextResponse.json({ success: true, isWebGameEnabled: true });
  }
}
