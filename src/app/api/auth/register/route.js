import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Wallet } from '@/lib/models/Wallet';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { username, mobile, password, referralCode } = body;

    if (!username || !mobile || !password) {
      return NextResponse.json({ status: false, message: 'Username, mobile, and password are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username: username.trim() }, { mobile: mobile.trim() }] }).lean();
    if (existingUser) {
      return NextResponse.json({ status: false, message: 'Username or mobile number already registered' }, { status: 409 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Generate a unique referral code for the user
    const generatedReferralCode = username.toUpperCase().substring(0, 5) + Math.floor(100 + Math.random() * 900);

    const user = await User.create({
      username: username.trim(),
      mobile: mobile.trim(),
      passwordHash,
      referralCode: generatedReferralCode,
      referredBy: referralCode || null,
      status: 'PENDING_VERIFICATION'
    });

    // Create the wallet for the new user
    await Wallet.create({
      userId: user._id,
      depositBalance: 0,
      winningBalance: 0,
      bonusBalance: referralCode ? 1000 : 0 // credit bonus if referred
    });

    const otpSessionId = `session_${user._id}`;

    return NextResponse.json({
      status: true,
      message: 'Registration initiated. OTP sent successfully.',
      data: {
        otpSessionId,
        otpExpiresInSec: 120
      }
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
