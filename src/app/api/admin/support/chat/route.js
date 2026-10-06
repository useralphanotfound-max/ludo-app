import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ChatMessage } from '@/lib/models/ChatMessage';
import { User } from '@/lib/models/User';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('userId');

    if (targetUserId) {
      // Get chat transcript with specific user
      const messages = await ChatMessage.find({ userId: targetUserId })
        .sort({ createdAt: 1 })
        .lean();

      return NextResponse.json({
        success: true,
        status: true,
        data: messages
      });
    }

    // Get list of active chat threads grouped by user with unread counts
    const chatUsers = await ChatMessage.distinct('userId');
    const users = await User.find({ _id: { $in: chatUsers } }).select('username mobile avatarUrl').lean();
    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    const threads = await Promise.all(chatUsers.map(async (uId) => {
      const lastMsg = await ChatMessage.findOne({ userId: uId }).sort({ createdAt: -1 }).lean();
      const unreadCount = await ChatMessage.countDocuments({ userId: uId, senderRole: 'PLAYER', isRead: false });
      const userInfo = userMap.get(uId.toString()) || {};

      return {
        userId: uId.toString(),
        username: userInfo.username || 'Unknown User',
        mobile: userInfo.mobile || 'N/A',
        avatarUrl: userInfo.avatarUrl || 'https://cdn.royalludo.com/avatars/av1.png',
        lastMessage: lastMsg?.text || '',
        lastTimestamp: lastMsg?.createdAt || null,
        unreadCount
      };
    }));

    threads.sort((a, b) => new Date(b.lastTimestamp || 0) - new Date(a.lastTimestamp || 0));

    return NextResponse.json({
      success: true,
      status: true,
      data: threads
    });

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
    const body = await req.json();
    const { userId, text } = body;

    if (!userId || !text) {
      return NextResponse.json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'User ID and response text are required' }
      }, { status: 400 });
    }

    if (text.trim().length > 500) {
      return NextResponse.json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Message text cannot exceed 500 characters' }
      }, { status: 400 });
    }

    const msg = await ChatMessage.create({
      userId,
      senderRole: 'ADMIN',
      text: text.trim(),
      isRead: false,
      timestamp: new Date()
    });

    return NextResponse.json({
      success: true,
      status: true,
      message: 'Admin reply sent to player successfully',
      data: msg
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
