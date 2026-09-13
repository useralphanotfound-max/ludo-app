import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { getAuthUser } from '@/lib/authHelper';

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

    const body = await req.json();
    const { device_token, deviceToken, fcm_token, fcmToken, platform, device_type, deviceType } = body;

    const tokenToSave = fcm_token || fcmToken || device_token || deviceToken || '';
    const platformToSave = platform || device_type || deviceType || 'android';

    if (tokenToSave) {
      user.fcmToken = tokenToSave;
    }
    user.deviceType = platformToSave;
    await user.save();

    return NextResponse.json({
      success: true,
      status: true,
      message: 'FCM push notification token registered successfully.',
      data: {
        user_id: user._id,
        fcm_token: user.fcmToken,
        platform: user.deviceType
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
