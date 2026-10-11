import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Deposit } from '@/lib/models/Deposit';
import { GameSettings } from '@/lib/models/GameSettings';
import { PaymentMethod } from '@/lib/models/PaymentMethod';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'royal-ludo-super-secret-jwt-key-2026';

function getUserFromToken(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const userPayload = getUserFromToken(req);
    if (!userPayload) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication token required' }
      }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const amount = Number(body.amount);
    const methodId = body.method_id || body.methodId || body.payment_method_id;

    if (!amount || amount < 10) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_AMOUNT', message: 'Minimum deposit amount is ₹10' }
      }, { status: 400 });
    }

    let settings = await GameSettings.findOne({ key: 'global_settings' });
    if (!settings) {
      settings = await GameSettings.create({ key: 'global_settings' });
    }

    // Check selected payment method or find active default
    let selectedMethod = null;
    if (methodId && mongoose.Types.ObjectId.isValid(methodId)) {
      selectedMethod = await PaymentMethod.findById(methodId);
    }
    if (!selectedMethod) {
      selectedMethod = await PaymentMethod.findOne({ isActive: true }).sort({ sortOrder: 1 });
    }

    const adminUpi = selectedMethod?.upiId || settings.adminUpiId || 'royalludo@upi';
    const adminQr = selectedMethod?.qrImageUrl || settings.adminUpiQrImageUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=${encodeURIComponent(adminUpi)}&pn=Royal%20Ludo&cu=INR`;
    const payeeName = selectedMethod?.payeeName || settings.adminUpiPayeeName || 'Royal Ludo Gaming';
    const methodType = selectedMethod?.type || 'UPI';
    const methodTitle = selectedMethod?.name || 'UPI Direct Transfer';

    const depositTimerMins = settings.depositTimerMinutes || 10;
    const expiresAt = new Date(Date.now() + depositTimerMins * 60 * 1000);
    const depositId = `DEP_${userPayload.userId.slice(-5)}_${Date.now().toString().slice(-6)}`;

    const deposit = await Deposit.create({
      depositId,
      userId: userPayload.userId,
      amount,
      paymentMethod: methodType,
      paymentMethodTitle: methodTitle,
      paymentMethodId: selectedMethod?._id || null,
      adminUpiId: adminUpi,
      adminQrImageUrl: adminQr,
      status: 'INITIATED',
      expiresAt
    });

    return NextResponse.json({
      success: true,
      message: `Deposit request created. Please pay ₹${amount} using the QR code or UPI ID within ${depositTimerMins} minutes and submit your 12-digit UTR number.`,
      data: {
        deposit_id: deposit.depositId,
        amount: deposit.amount,
        payment_method: deposit.paymentMethod,
        payment_method_title: deposit.paymentMethodTitle,
        admin_upi_id: deposit.adminUpiId,
        admin_qr_image_url: deposit.adminQrImageUrl,
        admin_payee_name: payeeName,
        status: deposit.status,
        expires_at: deposit.expiresAt.toISOString(),
        timer_minutes: depositTimerMins
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
