import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { SupportTicket } from '@/lib/models/SupportTicket';
import { getAuthUser } from '@/lib/authHelper';

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

    const body = await req.json();
    const { category, subject, message, transaction_id, transactionId, room_id, roomId } = body;

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
      roomId: room_id || roomId || null,
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
