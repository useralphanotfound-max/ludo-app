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

    const unreadCount = await ChatMessage.countDocuments({
      userId: user._id,
      senderRole: 'ADMIN',
      isRead: false
    });

    return NextResponse.json({
      success: true,
      status: true,
      data: {
        unread_count: unreadCount,
        unreadCount
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
