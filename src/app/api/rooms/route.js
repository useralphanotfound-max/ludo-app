import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Room } from '@/lib/models/Room';
import { Wallet } from '@/lib/models/Wallet';

export async function GET(req) {
  try {
    await connectDB();
    const rooms = await Room.find({ status: 'WAITING' }).sort({ createdAt: -1 });
    return NextResponse.json({ status: true, message: 'Rooms retrieved', data: rooms });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { gameMode = 'CLASSIC', playerCount = 2, entryFeeRs = 100, isPrivate = false } = body;
    const entryFeePaise = Math.round(entryFeeRs * 100);

    const user = await User.findOne({ role: 'USER' });
    if (!user) return NextResponse.json({ status: false, message: 'User not found' }, { status: 404 });

    const wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet || (wallet.depositBalance + wallet.winningBalance + wallet.bonusBalance) < entryFeePaise) {
      return NextResponse.json({ status: false, message: 'Insufficient balance for entry fee' }, { status: 400 });
    }

    wallet.depositBalance = Math.max(0, wallet.depositBalance - entryFeePaise);
    wallet.lockedBalance += entryFeePaise;
    await wallet.save();

    const roomCode = Math.floor(100000 + Math.random() * 900000).toString();

    const room = await Room.create({
      creatorId: user._id,
      gameMode,
      playerCount,
      entryFee: entryFeePaise,
      roomCode,
      isPrivate,
      joinedPlayers: [user._id],
      status: 'WAITING'
    });

    return NextResponse.json({ status: true, message: 'Room created successfully', data: room }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
