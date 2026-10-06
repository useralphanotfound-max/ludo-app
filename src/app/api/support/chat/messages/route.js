import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ChatMessage } from '@/lib/models/ChatMessage';
import { getAuthUser } from '@/lib/authHelper';

export async function GET(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      }, { status: 401 });
    }

    // Set isRead = true for all admin messages sent to this player
    await ChatMessage.updateMany(
      { userId: user._id, senderRole: 'ADMIN', isRead: false },
      { $set: { isRead: true } }
    );

    const messages = await ChatMessage.find({ userId: user._id })
      .sort({ createdAt: 1 })
      .lean();

    const formatted = messages.map(m => ({
      id: m._id.toString(),
      sender_role: m.senderRole,
      senderRole: m.senderRole,
      text: m.text,
      is_read: m.isRead,
      isRead: m.isRead,
      timestamp: m.timestamp || m.createdAt
    }));

    return NextResponse.json({
      success: true,
      status: true,
      data: formatted
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}

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

    // Text-only policy validation: Reject non-JSON or attachment payloads
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      return NextResponse.json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Chat is text-only. Media/file attachments are not allowed.' }
      }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const text = (body.text || body.message || '').toString().trim();

    if (!text) {
      return NextResponse.json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Message text cannot be empty' }
      }, { status: 400 });
    }

    if (text.length > 500) {
      return NextResponse.json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Message text exceeds maximum length of 500 characters' }
      }, { status: 400 });
    }

    const msg = await ChatMessage.create({
      userId: user._id,
      senderRole: 'PLAYER',
      text,
      isRead: false,
      timestamp: new Date()
    });

    return NextResponse.json({
      success: true,
      status: true,
      message: 'Message sent successfully',
      data: {
        id: msg._id.toString(),
        sender_role: msg.senderRole,
        text: msg.text,
        is_read: msg.isRead,
        timestamp: msg.timestamp
      }
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
