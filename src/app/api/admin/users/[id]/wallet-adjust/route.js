import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Wallet } from '@/lib/models/Wallet';
import { Transaction } from '@/lib/models/Transaction';
import { AdminAuditLog } from '@/lib/models/AdminAuditLog';

import mongoose from 'mongoose';

export async function POST(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await Promise.resolve(params);
    const userId = resolvedParams.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ status: false, message: 'Invalid User ID' }, { status: 400 });
    }

    const body = await req.json();
    const { actionType, subBalanceType, amountRs, reason, adminUsername, adminId } = body;

    if (!actionType || !['CREDIT', 'DEBIT'].includes(actionType)) {
      return NextResponse.json({ status: false, message: 'Invalid actionType. Must be CREDIT or DEBIT' }, { status: 400 });
    }

    if (!subBalanceType || !['deposit', 'winning', 'bonus'].includes(subBalanceType)) {
      return NextResponse.json({ status: false, message: 'Invalid subBalanceType. Must be deposit, winning, or bonus' }, { status: 400 });
    }

    const parsedAmountRs = parseFloat(amountRs);
    if (isNaN(parsedAmountRs) || parsedAmountRs <= 0) {
      return NextResponse.json({ status: false, message: 'Amount must be greater than 0' }, { status: 400 });
    }

    if (!reason || reason.trim().length < 5) {
      return NextResponse.json({ status: false, message: 'Mandatory reason required (at least 5 characters)' }, { status: 400 });
    }

    const amountPaise = Math.round(parsedAmountRs * 100);

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ status: false, message: 'User not found' }, { status: 404 });
    }

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId, depositBalance: 0, winningBalance: 0, bonusBalance: 0, lockedBalance: 0 });
    }

    const previousCash = wallet.depositBalance || 0;
    const previousWin = wallet.winningBalance || 0;
    const previousBonus = wallet.bonusBalance || 0;
    const previousTotal = previousCash + previousWin + previousBonus;

    let previousSubBalance = 0;
    if (subBalanceType === 'deposit') previousSubBalance = wallet.depositBalance;
    if (subBalanceType === 'winning') previousSubBalance = wallet.winningBalance;
    if (subBalanceType === 'bonus') previousSubBalance = wallet.bonusBalance;

    if (actionType === 'DEBIT' && previousSubBalance < amountPaise) {
      return NextResponse.json({
        status: false,
        message: `Insufficient ${subBalanceType} balance. Current: ₹${(previousSubBalance / 100).toFixed(2)}, Attempted debit: ₹${parsedAmountRs}`
      }, { status: 400 });
    }

    // Mutate Wallet
    const delta = actionType === 'CREDIT' ? amountPaise : -amountPaise;
    if (subBalanceType === 'deposit') wallet.depositBalance += delta;
    if (subBalanceType === 'winning') wallet.winningBalance += delta;
    if (subBalanceType === 'bonus') wallet.bonusBalance += delta;

    await wallet.save();

    const newCash = wallet.depositBalance;
    const newWin = wallet.winningBalance;
    const newBonus = wallet.bonusBalance;
    const newTotal = newCash + newWin + newBonus;

    // Record Transaction
    const transactionType = actionType === 'CREDIT' ? (subBalanceType === 'bonus' ? 'BONUS_CREDIT' : 'MANUAL_ADJUSTMENT') : 'MANUAL_ADJUSTMENT';
    const txn = await Transaction.create({
      userId,
      type: transactionType,
      amount: amountPaise,
      subBalanceType,
      status: 'SUCCESS',
      referenceId: `ADJ-${Date.now()}`,
      description: `[${actionType}] ${reason}`,
      reason: reason.trim(),
      previousBalance: previousTotal,
      newBalance: newTotal,
      performedBy: adminUsername || 'SuperAdmin',
      adminId: adminId || null
    });

    // Record Audit Log
    await AdminAuditLog.create({
      adminId: adminId || null,
      adminUsername: adminUsername || 'SuperAdmin',
      action: 'WALLET_MANUAL_ADJUSTMENT',
      targetEntity: 'Wallet',
      targetId: userId,
      details: `[${actionType}] ₹${parsedAmountRs} to ${subBalanceType} balance for user ${user.username}. Reason: ${reason}`,
      diff: {
        subBalanceType,
        actionType,
        amountRs: parsedAmountRs,
        previousSubBalanceRs: previousSubBalance / 100,
        newSubBalanceRs: (previousSubBalance + delta) / 100
      },
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent') || 'Admin Dashboard'
    });

    return NextResponse.json({
      status: true,
      message: `Successfully ${actionType.toLowerCase()}ed ₹${parsedAmountRs} to ${subBalanceType} balance`,
      data: {
        userId,
        transactionId: txn._id,
        updatedWallet: {
          depositBalanceRs: Math.round(wallet.depositBalance / 100),
          winningBalanceRs: Math.round(wallet.winningBalance / 100),
          bonusBalanceRs: Math.round(wallet.bonusBalance / 100),
          totalBalanceRs: Math.round(newTotal / 100)
        }
      }
    });
  } catch (error) {
    return NextResponse.json({ status: false, message: error.message }, { status: 500 });
  }
}
