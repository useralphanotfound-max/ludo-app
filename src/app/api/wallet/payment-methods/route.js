import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PaymentMethod } from '@/lib/models/PaymentMethod';
import { GameSettings } from '@/lib/models/GameSettings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    let methods = await PaymentMethod.find({ isActive: true, category: { $in: ['DEPOSIT', 'BOTH'] } })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    if (methods.length === 0) {
      let settings = await GameSettings.findOne({ key: 'global_settings' }).lean();
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
          instructions: 'Pay directly via any UPI application and submit the 12-digit UTR number.',
          category: 'DEPOSIT',
          isActive: true,
          sortOrder: 1
        },
        {
          name: 'QR Code Method 1 (Instant Scan & Pay)',
          type: 'QR_CODE',
          upiId: defaultUpi,
          payeeName: settings?.adminUpiPayeeName || 'Royal Ludo Gaming',
          qrImageUrl: defaultQr,
          minAmount: 50,
          maxAmount: 50000,
          instructions: 'Scan the QR code with any UPI app on another phone, complete payment and submit proof.',
          category: 'DEPOSIT',
          isActive: true,
          sortOrder: 2
        }
      ]);

      methods = await PaymentMethod.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
    }

    const formatted = methods.map(m => ({
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

    return NextResponse.json({
      success: true,
      status: true,
      data: formatted,
      methods: formatted
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      status: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
