import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/authHelper';

export async function GET(req) {
  try {
    const user = await getAuthUser(req);
    const mockNotifications = [
      {
        id: 'n1',
        type: 'MATCH_WIN',
        title: '🎉 Match Won!',
        body: 'You won ₹900 in Classic Match #882910!',
        is_read: false,
        isRead: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'n2',
        type: 'PROMOTION',
        title: '🎁 Weekend Deposit Bonus',
        body: 'Get 50% extra bonus credit on deposits above ₹500.',
        is_read: true,
        isRead: true,
        created_at: new Date(+new Date() - 86400000).toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      status: true,
      message: 'Notifications retrieved successfully',
      data: {
        notifications: mockNotifications,
        unread_count: 1
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
