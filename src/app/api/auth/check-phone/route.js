import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { phone, mobile } = body;

    const targetMobile = (phone || mobile || '').toString().trim();
    if (!targetMobile) {
      return NextResponse.json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Phone number is required' }
      }, { status: 400 });
    }

    const user = await User.findOne({ mobile: targetMobile }).select('username avatarId avatarUrl status').lean();

    return NextResponse.json({
      success: true,
      status: true,
      data: {
        exists: !!user,
        is_registered: !!user,
        phone: targetMobile,
        username: user ? user.username : null,
        avatar_id: user ? (user.avatarId || 'av1') : null
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
