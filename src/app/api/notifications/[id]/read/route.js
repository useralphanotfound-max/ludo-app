import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/authHelper';

export async function PUT(req, { params }) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      }, { status: 401 });
    }

    const { id } = await params;

    return NextResponse.json({
      success: true,
      status: true,
      message: 'Notification marked as read',
      data: {
        notification_id: id,
        is_read: true
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
