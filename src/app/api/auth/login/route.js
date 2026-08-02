import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { mobile, password } = body;

    if (!mobile || !password) {
      return NextResponse.json({ status: false, message: 'Mobile number and password are required' }, { status: 400 });
    }

    const user = await User.findOne({ mobile: mobile.trim() }).lean();
    if (!user) {
      return NextResponse.json({ status: false, message: 'Invalid mobile number or password' }, { status: 401 });
    }

    if (user.status === 'BANNED') {
      return NextResponse.json({ status: false, message: 'This account has been banned by the administrator' }, { status: 403 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ status: false, message: 'Invalid mobile number or password' }, { status: 401 });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET || 'royalludosecretkey123_superadmin_auth_9988',
      { expiresIn: '30d' }
    );

    return NextResponse.json({
      status: true,
      message: 'Login successful',
      data: {
        accessToken: token,
        refreshToken: token,
        expiresIn: 2592000,
        user: {
          id: user._id,
          username: user.username,
          mobile: user.mobile,
          role: user.role,
          avatarUrl: user.avatarUrl
        }
      }
    });

  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
