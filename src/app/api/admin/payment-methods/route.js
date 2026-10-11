import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PaymentMethod } from '@/lib/models/PaymentMethod';
import { Deposit } from '@/lib/models/Deposit';
import { saveUploadedFile } from '@/lib/uploadHelper';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const query = {};
    if (category && category !== 'ALL') query.category = category;
    if (type && type !== 'ALL') query.type = type;
    if (status === 'ACTIVE') query.isActive = true;
    if (status === 'INACTIVE') query.isActive = false;

    // Ensure default methods exist if database is empty
    const count = await PaymentMethod.countDocuments();
    if (count === 0) {
      await PaymentMethod.create([
        {
          name: 'UPI Method 1 (GPay / PhonePe / Paytm)',
          type: 'UPI',
          upiId: 'royalludo@upi',
          payeeName: 'Royal Ludo Gaming',
          qrImageUrl: '',
          minAmount: 50,
          maxAmount: 50000,
          instructions: 'Pay directly via Google Pay, PhonePe, Paytm or BHIM UPI and enter your 12-digit UTR number.',
          category: 'DEPOSIT',
          isActive: true,
          sortOrder: 1
        },
        {
          name: 'QR Code Method 1 (Instant Scan & Pay)',
          type: 'QR_CODE',
          upiId: 'royalludo.qr@icici',
          payeeName: 'Royal Ludo Official',
          qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=royalludo@upi&pn=Royal%20Ludo&cu=INR',
          minAmount: 50,
          maxAmount: 50000,
          instructions: 'Scan QR code with any UPI app on another device, complete payment and submit screenshot.',
          category: 'DEPOSIT',
          isActive: true,
          sortOrder: 2
        }
      ]);
    }

    const methods = await PaymentMethod.find(query).sort({ sortOrder: 1, createdAt: -1 }).lean();

    // Calculate usage count / totals per method
    const usageAgg = await Deposit.aggregate([
      { $group: { _id: '$paymentMethodTitle', totalDeposits: { $sum: 1 }, totalVolume: { $sum: '$amount' } } }
    ]);
    const usageMap = {};
    usageAgg.forEach(u => {
      if (u._id) usageMap[u._id] = u;
    });

    const formatted = methods.map(m => ({
      id: m._id,
      _id: m._id,
      name: m.name,
      type: m.type,
      upiId: m.upiId,
      payeeName: m.payeeName,
      qrImageUrl: m.qrImageUrl,
      minAmount: m.minAmount,
      maxAmount: m.maxAmount,
      instructions: m.instructions,
      category: m.category,
      isActive: m.isActive,
      sortOrder: m.sortOrder,
      createdAt: m.createdAt,
      stats: {
        totalDeposits: usageMap[m.name]?.totalDeposits || 0,
        totalVolumeRs: Math.round(usageMap[m.name]?.totalVolume || 0)
      }
    }));

    return NextResponse.json({
      success: true,
      status: true,
      data: formatted,
      summary: {
        total: formatted.length,
        active: formatted.filter(m => m.isActive).length,
        qrCount: formatted.filter(m => m.type === 'QR_CODE').length,
        upiCount: formatted.filter(m => m.type === 'UPI').length
      }
    });

  } catch (error) {
    console.error('Error in GET /api/admin/payment-methods:', error);
    return NextResponse.json({
      success: false,
      status: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const contentType = req.headers.get('content-type') || '';

    let name = '';
    let type = 'UPI';
    let upiId = '';
    let payeeName = 'Royal Ludo Gaming';
    let qrImageUrl = '';
    let minAmount = 50;
    let maxAmount = 50000;
    let instructions = '';
    let category = 'DEPOSIT';
    let isActive = true;
    let sortOrder = 0;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      name = (formData.get('name') || formData.get('title') || '').toString().trim();
      type = (formData.get('type') || 'UPI').toString().trim().toUpperCase();
      upiId = (formData.get('upiId') || formData.get('upi_id') || '').toString().trim();
      payeeName = (formData.get('payeeName') || formData.get('payee_name') || 'Royal Ludo Gaming').toString().trim();
      minAmount = Number(formData.get('minAmount') || formData.get('min_amount') || 50);
      maxAmount = Number(formData.get('maxAmount') || formData.get('max_amount') || 50000);
      instructions = (formData.get('instructions') || '').toString().trim();
      category = (formData.get('category') || 'DEPOSIT').toString().trim().toUpperCase();
      isActive = formData.get('isActive') === 'false' ? false : true;
      sortOrder = Number(formData.get('sortOrder') || 0);

      const file = formData.get('qr_image') || formData.get('qrImage') || formData.get('image') || formData.get('file');
      if (file && typeof file === 'object' && file.name) {
        const saved = await saveUploadedFile(file, 'qr');
        qrImageUrl = saved?.url || '';
      } else if (typeof file === 'string' && file.length > 0) {
        const saved = await saveUploadedFile(file, 'qr');
        qrImageUrl = saved?.url || file;
      }
    } else {
      const body = await req.json().catch(() => ({}));
      name = (body.name || body.title || '').toString().trim();
      type = (body.type || 'UPI').toString().trim().toUpperCase();
      upiId = (body.upiId || body.upi_id || '').toString().trim();
      payeeName = (body.payeeName || body.payee_name || 'Royal Ludo Gaming').toString().trim();
      minAmount = Number(body.minAmount || body.min_amount || 50);
      maxAmount = Number(body.maxAmount || body.max_amount || 50000);
      instructions = (body.instructions || '').toString().trim();
      category = (body.category || 'DEPOSIT').toString().trim().toUpperCase();
      isActive = body.isActive !== undefined ? Boolean(body.isActive) : true;
      sortOrder = Number(body.sortOrder || 0);

      const rawQr = body.qrImageUrl || body.qr_image_url || body.image || null;
      if (rawQr && (rawQr.startsWith('data:') || rawQr.length > 50)) {
        const saved = await saveUploadedFile(rawQr, 'qr');
        qrImageUrl = saved?.url || rawQr;
      } else if (rawQr) {
        qrImageUrl = rawQr;
      }
    }

    if (!name) {
      return NextResponse.json({
        success: false,
        status: false,
        error: { code: 'VALIDATION_ERROR', message: 'Method name/title is required.' }
      }, { status: 400 });
    }

    if (type === 'UPI' && !upiId) {
      return NextResponse.json({
        success: false,
        status: false,
        error: { code: 'VALIDATION_ERROR', message: 'UPI ID is required for UPI payment method.' }
      }, { status: 400 });
    }

    if (type === 'QR_CODE' && !qrImageUrl && !upiId) {
      return NextResponse.json({
        success: false,
        status: false,
        error: { code: 'VALIDATION_ERROR', message: 'QR Code image or UPI ID is required for QR payment method.' }
      }, { status: 400 });
    }

    // Auto-generate QR code image if UPI ID provided but no image uploaded
    if (type === 'QR_CODE' && !qrImageUrl && upiId) {
      qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&cu=INR`;
    }

    const newMethod = await PaymentMethod.create({
      name,
      type,
      upiId,
      payeeName,
      qrImageUrl,
      minAmount,
      maxAmount,
      instructions: instructions || (type === 'QR_CODE' ? 'Scan the QR code and submit the 12-digit UTR.' : 'Pay via UPI and enter the 12-digit UTR.'),
      category,
      isActive,
      sortOrder
    });

    return NextResponse.json({
      success: true,
      status: true,
      message: `Payment method "${newMethod.name}" created successfully.`,
      data: newMethod
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating payment method:', error);
    return NextResponse.json({
      success: false,
      status: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
