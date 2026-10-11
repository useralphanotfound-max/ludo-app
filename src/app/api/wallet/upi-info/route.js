import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { GameSettings } from '@/lib/models/GameSettings';
import { PaymentMethod } from '@/lib/models/PaymentMethod';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    let settings = await GameSettings.findOne({ key: 'global_settings' }).lean();
    if (!settings) {
      settings = await GameSettings.create({ key: 'global_settings' });
    }

    let methods = await PaymentMethod.find({ isActive: true, category: { $in: ['DEPOSIT', 'BOTH'] } })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    if (methods.length === 0) {
      const defaultUpi = settings?.adminUpiId || 'royalludo@upi';
      const defaultQr = settings?.adminUpiQrImageUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=${encodeURIComponent(defaultUpi)}&pn=Royal%20Ludo&cu=INR`;

      await PaymentMethod.create([
        {
          name: 'UPI Method 1 (GPay / PhonePe / Paytm)',
          type: 'UPI',
          upiId: defaultUpi,
          payeeName: settings?.adminUpiPayeeName || 'Royal Ludo Gaming',
          qrImageUrl: '',
          minAmount: 50,
          maxAmount: 50000,
          instructions: 'Pay via Google Pay, PhonePe, Paytm or BHIM UPI and enter 12-digit UTR.',
          category: 'DEPOSIT',
          isActive: true,
          sortOrder: 1
        },
        {
          name: 'QR Code Method 1 (Instant Scan & Pay)',
          type: 'QR_CODE',
          upiId: defaultUpi,
          payeeName: settings?.adminUpiPayeeName || 'Royal Ludo Official',
          qrImageUrl: defaultQr,
          minAmount: 50,
          maxAmount: 50000,
          instructions: 'Scan QR code with another mobile phone, complete payment and upload screenshot.',
          category: 'DEPOSIT',
          isActive: true,
          sortOrder: 2
        }
      ]);

      methods = await PaymentMethod.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
    }

    const formattedMethods = methods.map(m => ({
      id: m._id,
      _id: m._id,
      name: m.name,
      type: m.type,
      upi_id: m.upiId,
      upiId: m.upiId,
      payee_name: m.payeeName,
      payeeName: m.payeeName,
      qr_image_url: m.qrImageUrl,
      qrImageUrl: m.qrImageUrl,
      min_amount: m.minAmount,
      max_amount: m.maxAmount,
      instructions: m.instructions
    }));

    const primaryMethod = formattedMethods[0] || {};
    const primaryUpi = primaryMethod.upi_id || settings?.adminUpiId || 'royalludo@upi';
    const primaryQr = primaryMethod.qr_image_url || settings?.adminUpiQrImageUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=${encodeURIComponent(primaryUpi)}&pn=Royal%20Ludo&cu=INR`;

    return NextResponse.json({
      success: true,
      status: true,
      data: {
        upi_id: primaryUpi,
        qr_code: primaryQr,
        payee_name: primaryMethod.payee_name || settings?.adminUpiPayeeName || 'Royal Ludo Gaming',
        min_deposit: settings?.minDepositRs || 50,
        max_deposit: settings?.maxDepositRs || 50000,
        deposit_timer_minutes: settings?.depositTimerMinutes || 10,
        methods: formattedMethods
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
