import { NextResponse } from 'next/server';

export async function GET(req) {
  return NextResponse.json({
    status: true,
    message: 'Notifications retrieved',
    data: [
      {
        id: 'n1',
        type: 'MATCH_WIN',
        title: '🎉 Match Won!',
        body: 'You won ₹900 in Classic Match #882910!',
        isRead: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'n2',
        type: 'PROMOTION',
        title: '🎁 Weekend Deposit Bonus',
        body: 'Get 50% extra bonus credit on deposits above ₹500.',
        isRead: true,
        createdAt: new Date(+new Date() - 86400000).toISOString()
      }
    ]
  });
}
