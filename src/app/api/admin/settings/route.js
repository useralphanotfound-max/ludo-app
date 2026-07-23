import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { GameSettings } from '@/lib/models/GameSettings';
import { AdminAuditLog } from '@/lib/models/AdminAuditLog';
import { getClientIp } from '@/lib/ipHelper';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    let settings = await GameSettings.findOne({ key: 'global_settings' });
    if (!settings) settings = await GameSettings.create({ key: 'global_settings' });
    return NextResponse.json({ status: true, message: 'Settings retrieved', data: settings });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { platformCommissionPct, minDepositRs, maxDepositRs, minWithdrawRs, maxWithdrawRs, maintenanceMode, maintenanceMessage, forceUpdateVersion } = body;
    const clientIp = getClientIp(req);

    let settings = await GameSettings.findOne({ key: 'global_settings' });
    if (!settings) settings = new GameSettings({ key: 'global_settings' });

    if (platformCommissionPct !== undefined) settings.platformCommissionPct = platformCommissionPct;
    if (minDepositRs !== undefined) settings.minDepositRs = minDepositRs;
    if (maxDepositRs !== undefined) settings.maxDepositRs = maxDepositRs;
    if (minWithdrawRs !== undefined) settings.minWithdrawRs = minWithdrawRs;
    if (maxWithdrawRs !== undefined) settings.maxWithdrawRs = maxWithdrawRs;
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
    if (maintenanceMessage !== undefined) settings.maintenanceMessage = maintenanceMessage;
    if (forceUpdateVersion !== undefined) settings.forceUpdateVersion = forceUpdateVersion;

    await settings.save();

    await AdminAuditLog.create({
      adminUsername: 'superadmin',
      action: 'UPDATE_SETTINGS',
      targetEntity: 'SystemSettings',
      details: `Updated Game Settings: Commission=${settings.platformCommissionPct}%, Maintenance=${settings.maintenanceMode}`,
      ipAddress: clientIp,
      userAgent: req.headers.get('user-agent') || 'Unknown'
    });

    return NextResponse.json({ status: true, message: 'Game settings updated successfully', data: settings });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
