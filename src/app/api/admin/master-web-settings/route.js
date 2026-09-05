import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { GameSettings } from '@/lib/models/GameSettings';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const rawDoc = await mongoose.connection.db.collection('gamesettings').findOne({});
    let settings = await GameSettings.findOne({});
    if (!settings && !rawDoc) {
      settings = await GameSettings.create({ key: 'global_settings', isWebGameEnabled: true });
    }
    const isEnabled = rawDoc ? rawDoc.isWebGameEnabled !== false : (settings ? settings.isWebGameEnabled !== false : true);
    return NextResponse.json({
      status: true,
      data: {
        isWebGameEnabled: isEnabled
      }
    });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { isWebGameEnabled } = body;
    const targetState = Boolean(isWebGameEnabled);

    // Direct raw collection update to guarantee write in MongoDB
    await mongoose.connection.db.collection('gamesettings').updateMany(
      {},
      { $set: { isWebGameEnabled: targetState } },
      { upsert: true }
    );

    // Mongoose update
    await GameSettings.updateMany({}, { $set: { isWebGameEnabled: targetState } });

    return NextResponse.json({
      status: true,
      message: `Web App visibility set to ${targetState ? 'ENABLED (Game Visible)' : 'DISABLED (404 Page)'}`,
      data: {
        isWebGameEnabled: targetState
      }
    });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
