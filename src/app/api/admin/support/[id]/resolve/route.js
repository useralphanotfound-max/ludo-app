import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { SupportTicket } from '@/lib/models/SupportTicket';

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { notes } = body;

    const ticket = await SupportTicket.findOne({
      $or: [{ ticketId: id }, { _id: id }]
    });

    if (!ticket) {
      return NextResponse.json({ status: false, message: 'Support ticket not found' }, { status: 404 });
    }

    ticket.status = 'RESOLVED';
    await ticket.save();

    return NextResponse.json({
      status: true,
      message: 'Support ticket resolved successfully',
      data: ticket
    });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
