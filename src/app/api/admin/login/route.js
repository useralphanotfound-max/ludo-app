import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { AdminAuditLog } from '@/lib/models/AdminAuditLog';
import { getClientIp } from '@/lib/ipHelper';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { username, password } = body;
    const clientIp = getClientIp(req);
    const userAgent = req.headers.get('user-agent') || 'Unknown Browser';

    if (!username || !password) {
      return NextResponse.json({ status: false, message: 'Username and password required' }, { status: 400 });
    }

    const cleanInput = username.trim().toLowerCase();

    // Auto-ensure Superadmin exists in MongoDB Atlas if DB is empty
    let user = await User.findOne({
      $or: [
        { username: cleanInput },
        { mobile: cleanInput }
      ]
    });

    if (!user) {
      const superadminCount = await User.countDocuments({ role: 'SUPERADMIN' });
      if (superadminCount === 0 || cleanInput === 'admin@royalludo.com') {
        const salt = await bcrypt.genSalt(10);
        const adminPasswordHash = await bcrypt.hash('RoyalAdmin@123', salt);
        user = await User.create({
          username: 'admin@royalludo.com',
          mobile: '9999999999',
          passwordHash: adminPasswordHash,
          role: 'SUPERADMIN',
          status: 'ACTIVE',
          avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=superadmin',
          referralCode: 'ROYALADMIN'
        });
        console.log('[Auth] Default Superadmin account auto-created in MongoDB Atlas');
      }
    }

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      await AdminAuditLog.create({
        adminUsername: username,
        action: 'ADMIN_LOGIN',
        details: 'FAILED: Invalid superadmin username or unauthorized role',
        ipAddress: clientIp,
        userAgent: userAgent.substring(0, 150)
      }).catch(() => {});
      return NextResponse.json({ status: false, message: 'Invalid admin credentials or unauthorized handle' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      await AdminAuditLog.create({
        adminId: user._id,
        adminUsername: user.username,
        action: 'ADMIN_LOGIN',
        details: 'FAILED: Password mismatch',
        ipAddress: clientIp,
        userAgent: userAgent.substring(0, 150)
      }).catch(() => {});
      return NextResponse.json({ status: false, message: 'Incorrect superadmin password' }, { status: 401 });
    }

    user.lastLoginAt = new Date();
    user.lastLoginIp = clientIp;
    await user.save();

    await AdminAuditLog.create({
      adminId: user._id,
      adminUsername: user.username,
      action: 'ADMIN_LOGIN',
      details: `SUCCESSFUL Superadmin Login from IP: ${clientIp}`,
      ipAddress: clientIp,
      userAgent: userAgent.substring(0, 150)
    }).catch(() => {});

    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET || 'royalludosecretkey123_superadmin_auth_9988',
      { expiresIn: '30d' }
    );

    return NextResponse.json({
      status: true,
      message: 'Superadmin authenticated successfully',
      data: {
        token,
        admin: {
          id: user._id,
          username: user.username,
          role: user.role,
          avatarUrl: user.avatarUrl,
          lastLoginIp: clientIp,
          lastLoginAt: user.lastLoginAt
        }
      }
    });
  } catch (error) {
    console.error('[Admin Login Error]', error);
    return NextResponse.json({ status: false, message: error.message || 'Authentication server error' }, { status: 500 });
  }
}
