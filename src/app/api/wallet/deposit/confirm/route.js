import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Deposit } from '@/lib/models/Deposit';
import { getAuthUser } from '@/lib/authHelper';
import { creditWallet } from '@/lib/walletHelper';

export async function POST(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      }, { status: 401 });
    }

    let depId = null;
    let utr = '';
    let depositAmount = 0;
    let proofImg = null;

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      depId = formData.get('transaction_id') || formData.get('transactionId') || formData.get('deposit_id') || formData.get('depositId');
      utr = (formData.get('utr_number') || formData.get('utrNumber') || formData.get('gateway_payment_id') || '').toString().trim();
      depositAmount = Number(formData.get('amount') || 0);

      const file = formData.get('proof_image') || formData.get('proofImage') || formData.get('screenshot') || formData.get('file');
      if (file && typeof file === 'object' && file.name) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64 = buffer.toString('base64');
        const mimeType = file.type || 'image/png';
        proofImg = `data:${mimeType};base64,${base64}`;
      } else if (typeof file === 'string' && file.length > 0) {
        proofImg = file;
      }
    } else {
      const body = await req.json().catch(() => ({}));
      depId = body.transaction_id || body.transactionId || body.deposit_id || body.depositId;
      utr = (body.utr_number || body.utrNumber || body.gateway_payment_id || '').toString().trim();
      depositAmount = Number(body.amount || 0);
      proofImg = body.proof_image_url || body.proofImageUrl || body.screenshot || null;
    }

    if (!utr || utr.length < 6) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_UTR', message: 'Please enter a valid UTR / Transaction ID (minimum 6 digits)' }
      }, { status: 400 });
    }

    // Check duplicate UTR
    const existingUtr = await Deposit.findOne({
      utrNumber: utr,
      status: { $in: ['PENDING_APPROVAL', 'APPROVED'] }
    });

    if (existingUtr) {
      return NextResponse.json({
        success: false,
        error: { code: 'DUPLICATE_UTR', message: 'This UTR / Transaction ID has already been submitted.' }
      }, { status: 400 });
    }

    let deposit = null;
    if (depId) {
      deposit = await Deposit.findOne({ depositId: depId });
    }

    if (!deposit) {
      deposit = await Deposit.findOne({ userId: user._id, status: 'INITIATED' }).sort({ createdAt: -1 });
    }

    if (!deposit) {
      // Create new Deposit request directly
      const reqAmount = depositAmount > 0 ? depositAmount : 500;
      const newDepId = `DEP_${user._id.toString().slice(-5)}_${Date.now().toString().slice(-6)}`;
      deposit = await Deposit.create({
        depositId: newDepId,
        userId: user._id,
        amount: reqAmount,
        adminUpiId: 'royalludo@upi',
        adminQrImageUrl: 'https://cdn.royalludo.com/qr/admin_upi_qr.png',
        utrNumber: utr,
        proofImageUrl: proofImg,
        status: 'PENDING_APPROVAL',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
    } else {
      deposit.utrNumber = utr;
      if (proofImg) deposit.proofImageUrl = proofImg;
      if (depositAmount > 0) deposit.amount = depositAmount;
      deposit.status = 'PENDING_APPROVAL';
      await deposit.save();
    }

    return NextResponse.json({
      success: true,
      message: `Deposit request of ₹${deposit.amount} submitted successfully! Pending admin approval.`,
      data: {
        deposit_id: deposit.depositId,
        amount: deposit.amount,
        utr_number: deposit.utrNumber,
        status: 'PENDING_APPROVAL'
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
