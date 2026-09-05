import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { AdminAuditLog } from '@/lib/models/AdminAuditLog';
import { getClientIp } from '@/lib/ipHelper';

import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function POST(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ status: false, message: 'Invalid User ID' }, { status: 400 });
    }

    const body = await req.json();
    const { status, reason } = body;
    const clientIp = getClientIp(req);

    const user = await User.findById(id);
    if (!user) return NextResponse.json({ status: false, message: 'User not found' }, { status: 404 });

    const prevStatus = user.status;
    user.status = status;
    await user.save();

    const actionName = status === 'BANNED' ? 'BAN_USER' : 'UNBAN_USER';

    await AdminAuditLog.create({
      adminUsername: 'superadmin',
      action: actionName,
      targetEntity: `User:${user.username}`,
      targetId: user._id.toString(),
      details: `User status changed from ${prevStatus} to ${status}. Reason: ${reason || 'N/A'}`,
      ipAddress: clientIp,
      userAgent: req.headers.get('user-agent') || 'Unknown'
    });

    return NextResponse.json({ status: true, message: `User status updated to ${status}` });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}

export const PATCH = POST;
