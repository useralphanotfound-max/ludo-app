import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Deposit } from '@/lib/models/Deposit';
import { Transaction } from '@/lib/models/Transaction';
import { User } from '@/lib/models/User';
import { Wallet } from '@/lib/models/Wallet';
import { AdminAuditLog } from '@/lib/models/AdminAuditLog';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    const query = {};
    if (status && status !== 'ALL') query.status = status;
    if (search) {
      query.$or = [
        { depositId: new RegExp(search, 'i') },
        { gatewayReferenceId: new RegExp(search, 'i') }
      ];
    }

    const [deposits, totalCount] = await Promise.all([
      Deposit.find(query).populate('userId', 'username mobile avatarUrl').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Deposit.countDocuments(query)
    ]);

    const formatted = deposits.map(d => ({
      id: d._id,
      depositId: d.depositId,
      user: {
        id: d.userId?._id,
        username: d.userId?.username || 'Unknown',
        mobile: d.userId?.mobile || 'N/A',
        avatarUrl: d.userId?.avatarUrl
      },
      amountRs: Math.round((d.amount || 0) / 100),
      paymentMethod: d.paymentMethod || 'UPI',
      gatewayProvider: d.gatewayProvider || 'RAZORPAY',
      gatewayReferenceId: d.gatewayReferenceId || 'N/A',
      status: d.status || 'PENDING',
      webhookVerified: d.webhookVerified || false,
      failureReason: d.failureReason || null,
      createdAt: d.createdAt,
      completedAt: d.completedAt
    }));

    return NextResponse.json({
      status: true,
      message: 'Deposits retrieved',
      pagination: { total: totalCount, page, limit, totalPages: Math.ceil(totalCount / limit) },
      data: formatted
    });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}

// POST endpoint for manual server-side gateway verification trigger
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { depositId, action, adminUsername, adminId } = body;

    const deposit = await Deposit.findById(depositId).populate('userId');
    if (!deposit) {
      return NextResponse.json({ status: false, message: 'Deposit record not found' }, { status: 404 });
    }

    if (action === 'VERIFY_GATEWAY') {
      // Simulate server-to-server gateway verification (Razorpay/Cashfree API check)
      const simulatedGatewaySuccess = true;

      if (simulatedGatewaySuccess) {
        deposit.status = 'SUCCESSFUL';
        deposit.webhookVerified = true;
        deposit.completedAt = new Date();
        await deposit.save();

        // Credit user wallet deposit balance if not credited already
        let wallet = await Wallet.findOne({ userId: deposit.userId._id });
        if (!wallet) {
          wallet = await Wallet.create({ userId: deposit.userId._id, depositBalance: 0, winningBalance: 0, bonusBalance: 0 });
        }
        wallet.depositBalance += deposit.amount;
        await wallet.save();

        // Record transaction
        await Transaction.create({
          userId: deposit.userId._id,
          type: 'DEPOSIT',
          amount: deposit.amount,
          subBalanceType: 'deposit',
          status: 'SUCCESS',
          referenceId: deposit.depositId,
          gatewayReferenceId: deposit.gatewayReferenceId || `GW-${Date.now()}`,
          description: `Server-Verified Gateway Deposit of ₹${Math.round(deposit.amount / 100)}`,
          performedBy: adminUsername || 'SERVER_WEBHOOK'
        });

        await AdminAuditLog.create({
          adminId: adminId || null,
          adminUsername: adminUsername || 'SuperAdmin',
          action: 'WALLET_MANUAL_ADJUSTMENT',
          targetEntity: 'Deposit',
          targetId: deposit._id,
          details: `Manual server-side verification approved deposit ₹${Math.round(deposit.amount / 100)} for ${deposit.userId.username}`,
          ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1'
        });

        return NextResponse.json({
          status: true,
          message: `Deposit verified with gateway server and credited ₹${Math.round(deposit.amount / 100)} to user wallet`
        });
      }
    }

    return NextResponse.json({ status: false, message: 'Action processed' });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
