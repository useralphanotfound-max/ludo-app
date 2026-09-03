import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Wallet } from '@/lib/models/Wallet';
import { Transaction } from '@/lib/models/Transaction';
import { Room } from '@/lib/models/Room';
import { Match } from '@/lib/models/Match';
import { Dispute } from '@/lib/models/Dispute';
import { WithdrawalRequest } from '@/lib/models/WithdrawalRequest';
import { Deposit } from '@/lib/models/Deposit';
import { SecurityAlert } from '@/lib/models/SecurityAlert';
import { LoginHistory } from '@/lib/models/LoginHistory';
import { AdminAuditLog } from '@/lib/models/AdminAuditLog';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    await connectDB();

    // Delete test data collections while preserving Super Admin & Game Settings
    const [
      usersResult,
      walletsResult,
      depositsResult,
      withdrawalsResult,
      transactionsResult,
      roomsResult,
      matchesResult,
      disputesResult,
      securityResult,
      loginsResult,
      auditLogsResult
    ] = await Promise.all([
      User.deleteMany({ role: 'USER' }),
      Wallet.deleteMany({}),
      Deposit.deleteMany({}),
      WithdrawalRequest.deleteMany({}),
      Transaction.deleteMany({}),
      Room.deleteMany({}),
      Match.deleteMany({}),
      Dispute.deleteMany({}),
      SecurityAlert.deleteMany({}),
      LoginHistory.deleteMany({}),
      AdminAuditLog.deleteMany({})
    ]);

    const results = {
      usersDeleted: usersResult.deletedCount || 0,
      walletsDeleted: walletsResult.deletedCount || 0,
      depositsDeleted: depositsResult.deletedCount || 0,
      withdrawalsDeleted: withdrawalsResult.deletedCount || 0,
      transactionsDeleted: transactionsResult.deletedCount || 0,
      roomsDeleted: roomsResult.deletedCount || 0,
      matchesDeleted: matchesResult.deletedCount || 0,
      disputesDeleted: disputesResult.deletedCount || 0,
      securityAlertsDeleted: securityResult.deletedCount || 0,
      loginHistoryDeleted: loginsResult.deletedCount || 0,
      auditLogsDeleted: auditLogsResult.deletedCount || 0
    };

    return NextResponse.json({
      status: true,
      message: 'Test data cleared successfully from MongoDB Atlas. Super Admin and System Settings preserved.',
      deletedMetrics: results
    });
  } catch (error) {
    console.error('[Clear Test Data API Error]', error.message);
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
