import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { SupportTicket } from '@/lib/models/SupportTicket';
import { User } from '@/lib/models/User';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const tickets = await SupportTicket.find()
      .populate('userId', 'username mobile avatarUrl')
      .sort({ createdAt: -1 })
      .lean();

    const formatted = tickets.map(t => ({
      id: t.ticketId || t._id.toString(),
      _id: t._id.toString(),
      ticketId: t.ticketId || t._id.toString(),
      user: t.userId?.username || 'Unknown User',
      mobile: t.userId?.mobile || 'N/A',
      category: t.category?.toUpperCase() || 'GENERAL',
      priority: t.category === 'payment' ? 'HIGH' : 'MEDIUM',
      status: t.status === 'RESOLVED' ? 'Resolved' : (t.status === 'IN_PROGRESS' ? 'In Progress' : 'Open'),
      subject: t.subject || 'Support Inquiry',
      message: t.message || '',
      description: t.message || '',
      createdAt: t.createdAt
    }));

    return NextResponse.json({ status: true, data: formatted });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
