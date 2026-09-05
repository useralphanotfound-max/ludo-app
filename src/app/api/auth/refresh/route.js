import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'royal-ludo-super-secret-jwt-key-2026';

export async function POST(req) {
  try {
    const body = await req.json();
    const { refresh_token, refreshToken } = body;
    const token = refresh_token || refreshToken;

    if (!token) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Refresh token is required' }
      }, { status: 401 });
    }

    let decoded = null;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return NextResponse.json({
        success: false,
        error: { code: 'TOKEN_EXPIRED', message: 'Refresh token expired or invalid' }
      }, { status: 401 });
    }

    const userId = decoded.userId || decoded.id;
    const newAccessToken = jwt.sign(
      { userId, role: decoded.role || 'USER' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      success: true,
      data: {
        access_token: newAccessToken,
        expires_in: 86400
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
