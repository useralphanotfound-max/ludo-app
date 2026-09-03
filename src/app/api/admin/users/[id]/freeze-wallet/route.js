import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { AdminAuditLog } from '@/lib/models/AdminAuditLog';

export async function POST(req, { params }) {
  try {
    await connectDB();
    const userId = params.id;
    const body = await req.json();
    const { freeze, reason, adminUsername, adminId } = body;

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ status: false, message: 'User not found' }, { status: 404 });
    }

    const previousState = user.isWalletFrozen;
    user.isWalletFrozen = Boolean(freeze);
    await user.save();

    await AdminAuditLog.create({
      adminId: adminId || null,
      adminUsername: adminUsername || 'SuperAdmin',
      action: freeze ? 'WALLET_MANUAL_ADJUSTMENT' : 'UNBAN_USER',
      targetEntity: 'User',
      targetId: userId,
      details: `${freeze ? 'Froze' : 'Unfroze'} wallet for user ${user.username}. Reason: ${reason || 'N/A'}`,
      diff: {
        previousState,
        newState: user.isWalletFrozen,
        reason
      },
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent') || 'Admin Dashboard'
    });

    return NextResponse.json({
      status: true,
      message: `User wallet successfully ${freeze ? 'frozen' : 'unfrozen'}`,
      data: { userId, isWalletFrozen: user.isWalletFrozen }
    });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
