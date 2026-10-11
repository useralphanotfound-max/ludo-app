import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { SupportTicket } from '@/lib/models/SupportTicket';
import { getAuthUser } from '@/lib/authHelper';
import { saveUploadedFile } from '@/lib/uploadHelper';

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

    let category = '';
    let subject = '';
    let message = '';
    let transactionId = null;
    let roomId = null;
    let attachmentUrl = '';

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      category = formData.get('category') || '';
      subject = formData.get('subject') || '';
      message = formData.get('message') || '';
      transactionId = formData.get('transaction_id') || formData.get('transactionId') || null;
      roomId = formData.get('room_id') || formData.get('roomId') || formData.get('match_id') || formData.get('matchId') || null;

      const file = formData.get('attachment') || formData.get('file') || formData.get('screenshot');
      if (file && typeof file === 'object' && file.name) {
        const saved = await saveUploadedFile(file, 'support');
        attachmentUrl = saved?.url || '';
      } else if (typeof file === 'string' && file.length > 0) {
        const saved = await saveUploadedFile(file, 'support');
        attachmentUrl = saved?.url || file;
      }
    } else {
      const body = await req.json().catch(() => ({}));
      category = body.category || '';
      subject = body.subject || '';
      message = body.message || '';
      transactionId = body.transaction_id || body.transactionId || null;
      roomId = body.room_id || body.roomId || body.match_id || body.matchId || null;
      const rawAttach = body.attachment || body.attachment_url || '';
      if (rawAttach) {
        const saved = await saveUploadedFile(rawAttach, 'support');
        attachmentUrl = saved?.url || rawAttach;
      }
    }

    if (!category || !subject || !message) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Category, subject, and message are required fields.' }
      }, { status: 422 });
    }

    const ticketId = `tkt_${user._id.toString().slice(-4)}_${Date.now().toString().slice(-6)}`;
    const estimatedResponse = new Date(Date.now() + 15 * 60 * 1000);

    const ticket = await SupportTicket.create({
      ticketId,
      userId: user._id,
      category,
      subject: subject.trim(),
      message: message.trim(),
      transactionId: transaction_id || transactionId || null,
      roomId: room_id || roomId || match_id || matchId || null,
      attachmentUrl: attachment || attachment_url || '',
      status: 'OPEN',
      estimatedResponse
    });

    return NextResponse.json({
      success: true,
      message: 'Your support ticket has been submitted',
      data: {
        ticket_id: ticket.ticketId,
        category: ticket.category,
        subject: ticket.subject,
        status: ticket.status,
        created_at: ticket.createdAt,
        estimated_response: ticket.estimatedResponse
      }
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
