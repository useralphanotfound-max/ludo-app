import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { AdminAuditLog } from '@/lib/models/AdminAuditLog';
import { getClientIp } from '@/lib/ipHelper';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'royalludosecretkey123_superadmin_auth_9988';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { username, password } = body;
    const clientIp = getClientIp(req);

    if (!username || !password) {
      return NextResponse.json({ status: false, message: 'Superadmin username handle and password are required' }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();

    // Fast-path lookup for superadmin
    let adminUser = await User.findOne({
      $or: [{ username: cleanUsername }, { email: cleanUsername }],
      role: 'SUPERADMIN'
    });

    // Auto-seed default superadmin account if database is fresh
    if (!adminUser && (cleanUsername === 'admin@royalludo.com' || cleanUsername === 'superadmin')) {
      const hashedPassword = await bcrypt.hash('RoyalAdmin@123', 10);
      try {
        adminUser = await User.create({
          username: 'superadmin',
          email: 'admin@royalludo.com',
          mobile: '9999999999',
          passwordHash: hashedPassword,
          role: 'SUPERADMIN',
          status: 'ACTIVE',
          referralCode: 'ADMIN001'
        });
      } catch (seedErr) {
        // If username/mobile unique index exists, fetch existing
        adminUser = await User.findOne({ role: 'SUPERADMIN' });
      }
    }

    if (!adminUser) {
      return NextResponse.json({ status: false, message: 'Invalid superadmin credentials' }, { status: 401 });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, adminUser.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ status: false, message: 'Invalid superadmin password credentials' }, { status: 401 });
    }

    // Generate JWT Auth Token
    const token = jwt.sign(
      { userId: adminUser._id, username: adminUser.username, role: adminUser.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Non-blocking IP audit log creation & last login update
    adminUser.lastLoginAt = new Date();
    adminUser.lastLoginIp = clientIp;
    adminUser.save().catch(e => console.error('Last login update err:', e));

    AdminAuditLog.create({
      adminUsername: adminUser.username,
      action: 'ADMIN_LOGIN',
      targetEntity: 'SuperadminPortal',
      details: `Superadmin logged in successfully from IP ${clientIp}`,
      ipAddress: clientIp,
      userAgent: req.headers.get('user-agent') || 'Unknown'
    }).catch(e => console.error('Audit log err:', e));

    return NextResponse.json({
      status: true,
      message: 'Superadmin authenticated successfully',
      data: {
        token,
        admin: {
          id: adminUser._id,
          username: adminUser.username,
          email: adminUser.email,
          role: adminUser.role,
          avatarUrl: adminUser.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=superadmin',
          lastLoginIp: clientIp
        }
      }
    });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message || 'Superadmin login error' }, { status: 500 });
  }
}
