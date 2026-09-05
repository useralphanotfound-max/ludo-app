import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { GameSettings } from '@/lib/models/GameSettings';

export async function GET() {
  try {
    await connectDB();
    const settings = await GameSettings.findOne({ key: 'global_settings' });

    return NextResponse.json({
      success: true,
      data: {
        whatsapp: settings?.supportPhone || '+919999999999',
        email: settings?.supportEmail || 'support@royalludo.com',
        telegram: settings?.supportTelegram || 'https://t.me/royalludo_support',
        working_hours: '24/7',
        avg_response_time: '< 15 minutes'
      }
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      success: true,
      data: {
        whatsapp: '+919999999999',
        email: 'support@royalludo.com',
        telegram: 'https://t.me/royalludo_support',
        working_hours: '24/7',
        avg_response_time: '< 15 minutes'
      }
    }, { status: 200 });
  }
}
