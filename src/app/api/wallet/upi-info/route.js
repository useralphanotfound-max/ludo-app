import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { GameSettings } from '@/lib/models/GameSettings';

export async function GET() {
  try {
    await connectDB();
    let settings = await GameSettings.findOne({ key: 'global_settings' });
    if (!settings) {
      settings = await GameSettings.create({ key: 'global_settings' });
    }

    return NextResponse.json({
      success: true,
      status: true,
      data: {
        upi_id: settings.adminUpiId || 'royalludo@upi',
        qr_code: settings.adminUpiQrImageUrl || 'https://cdn.royalludo.com/qr/admin_upi_qr.png',
        payee_name: settings.adminUpiPayeeName || 'Royal Ludo Gaming',
        min_deposit: settings.minDepositRs || 50,
        max_deposit: settings.maxDepositRs || 50000,
        deposit_timer_minutes: settings.depositTimerMinutes || 10
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
