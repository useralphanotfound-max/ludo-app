import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PaymentMethod } from '@/lib/models/PaymentMethod';
import { saveUploadedFile } from '@/lib/uploadHelper';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid ID' } }, { status: 400 });
    }

    const method = await PaymentMethod.findById(id).lean();
    if (!method) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Payment method not found' } }, { status: 404 });
    }

    return NextResponse.json({ success: true, status: true, data: method });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid ID' } }, { status: 400 });
    }

    const method = await PaymentMethod.findById(id);
    if (!method) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Payment method not found' } }, { status: 404 });
    }

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      if (formData.has('name') || formData.has('title')) {
        method.name = (formData.get('name') || formData.get('title')).toString().trim();
      }
      if (formData.has('type')) {
        method.type = formData.get('type').toString().trim().toUpperCase();
      }
      if (formData.has('upiId') || formData.has('upi_id')) {
        method.upiId = (formData.get('upiId') || formData.get('upi_id')).toString().trim();
      }
      if (formData.has('payeeName') || formData.has('payee_name')) {
        method.payeeName = (formData.get('payeeName') || formData.get('payee_name')).toString().trim();
      }
      if (formData.has('minAmount') || formData.has('min_amount')) {
        method.minAmount = Number(formData.get('minAmount') || formData.get('min_amount'));
      }
      if (formData.has('maxAmount') || formData.has('max_amount')) {
        method.maxAmount = Number(formData.get('maxAmount') || formData.get('max_amount'));
      }
      if (formData.has('instructions')) {
        method.instructions = formData.get('instructions').toString().trim();
      }
      if (formData.has('isActive')) {
        method.isActive = formData.get('isActive') === 'false' ? false : true;
      }
      if (formData.has('sortOrder')) {
        method.sortOrder = Number(formData.get('sortOrder'));
      }

      const file = formData.get('qr_image') || formData.get('qrImage') || formData.get('image') || formData.get('file');
      if (file && typeof file === 'object' && file.name) {
        const saved = await saveUploadedFile(file, 'qr');
        if (saved?.url) method.qrImageUrl = saved.url;
      } else if (typeof file === 'string' && file.length > 0) {
        const saved = await saveUploadedFile(file, 'qr');
        if (saved?.url) method.qrImageUrl = saved.url;
      }
    } else {
      const body = await req.json().catch(() => ({}));
      if (body.name !== undefined) method.name = body.name.toString().trim();
      if (body.type !== undefined) method.type = body.type.toString().trim().toUpperCase();
      if (body.upiId !== undefined) method.upiId = body.upiId.toString().trim();
      if (body.payeeName !== undefined) method.payeeName = body.payeeName.toString().trim();
      if (body.minAmount !== undefined) method.minAmount = Number(body.minAmount);
      if (body.maxAmount !== undefined) method.maxAmount = Number(body.maxAmount);
      if (body.instructions !== undefined) method.instructions = body.instructions.toString().trim();
      if (body.isActive !== undefined) method.isActive = Boolean(body.isActive);
      if (body.sortOrder !== undefined) method.sortOrder = Number(body.sortOrder);

      const rawQr = body.qrImageUrl || body.qr_image_url || null;
      if (rawQr && (rawQr.startsWith('data:') || rawQr.length > 50)) {
        const saved = await saveUploadedFile(rawQr, 'qr');
        if (saved?.url) method.qrImageUrl = saved.url;
      } else if (rawQr) {
        method.qrImageUrl = rawQr;
      }
    }

    await method.save();

    return NextResponse.json({
      success: true,
      status: true,
      message: `Payment method updated successfully.`,
      data: method
    });

  } catch (error) {
    console.error('Error updating payment method:', error);
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid ID' } }, { status: 400 });
    }

    const deleted = await PaymentMethod.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Method not found' } }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      status: true,
      message: `Payment method "${deleted.name}" deleted successfully.`
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
  }
}
