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

    const isLeaderboardEnabled = settings.isLeaderboardEnabled !== false;

    return NextResponse.json({
      success: true,
      status: true,
      data: {
        min_deposit: settings.minDepositRs || 50,
        max_deposit: settings.maxDepositRs || 50000,
        min_withdrawal: settings.minWithdrawRs || 100,
        max_withdrawal: settings.maxWithdrawRs || 25000,
        platform_commission_percent: settings.platformCommissionPct || 10,
        support_whatsapp: settings.supportWhatsapp || '+919876543210',
        support_telegram: settings.supportTelegram || '@royalludosupport',
        maintenance_mode: settings.maintenanceMode || false,
        maintenance_message: settings.maintenanceMessage || 'Undergoing scheduled maintenance.',
        app_version: settings.forceUpdateVersion || '1.0.0',
        ludo_king_app_url: settings.ludoKingAppUrl || 'ludoking://play',
        is_leaderboard_enabled: isLeaderboardEnabled,
        isLeaderboardEnabled: isLeaderboardEnabled
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
