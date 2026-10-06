import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ChatMessage } from '@/lib/models/ChatMessage';
import { getAuthUser } from '@/lib/authHelper';

export async function PUT(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      }, { status: 401 });
    }

    const result = await ChatMessage.updateMany(
      { userId: user._id, senderRole: 'ADMIN', isRead: false },
      { $set: { isRead: true } }
    );

    return NextResponse.json({
      success: true,
      status: true,
      message: 'All admin support messages marked as read.',
      data: {
        updated_count: result.modifiedCount || 0
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}

export async function POST(req) {
  return PUT(req);
}
