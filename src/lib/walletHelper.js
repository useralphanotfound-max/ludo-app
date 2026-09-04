import { Wallet } from '@/lib/models/Wallet';
import { Transaction } from '@/lib/models/Transaction';
import { connectDB } from '@/lib/db';

/**
 * Get or initialize user wallet
 */
export async function getOrCreateWallet(userId) {
  await connectDB();
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = await Wallet.create({
      userId,
      depositBalance: 0,
      winningBalance: 0,
      bonusBalance: 0,
      lockedBalance: 0,
      pendingBalance: 0
    });
  }
  return wallet;
}

/**
 * Safely credit funds to user wallet and record transaction history.
 */
export async function creditWallet({
  userId,
  amount,
  type, // 'DEPOSIT', 'MATCH_WIN', 'REFUND', 'BONUS_CREDIT', 'MANUAL_ADJUSTMENT'
  subBalanceType = 'deposit', // 'deposit', 'winning', 'bonus'
  referenceId = '',
  description = '',
  adminId = null,
  performedBy = 'system'
}) {
  await connectDB();
  if (amount <= 0) {
    throw new Error('Credit amount must be greater than 0');
  }

  const wallet = await getOrCreateWallet(userId);
  const previousTotal = wallet.depositBalance + wallet.winningBalance + wallet.bonusBalance;

  let updateField = 'depositBalance';
  if (subBalanceType === 'winning') updateField = 'winningBalance';
  if (subBalanceType === 'bonus') updateField = 'bonusBalance';

  wallet[updateField] += amount;
  await wallet.save();

  const newTotal = wallet.depositBalance + wallet.winningBalance + wallet.bonusBalance;

  const txn = await Transaction.create({
    userId,
    type,
    amount,
    subBalanceType,
    status: 'SUCCESS',
    referenceId,
    description: description || `${type} of ₹${amount}`,
    previousBalance: previousTotal,
    newBalance: newTotal,
    adminId,
    performedBy
  });

  return { wallet, transaction: txn };
}

/**
 * Safely debit funds from user wallet (Strict No-Negative Balance Rule).
 */
export async function debitWallet({
  userId,
  amount,
  type, // 'MATCH_ENTRY', 'WITHDRAWAL', 'MANUAL_ADJUSTMENT'
  subBalanceType = 'mixed', // 'deposit', 'winning', 'bonus', 'mixed'
  referenceId = '',
  description = '',
  adminId = null,
  performedBy = 'system'
}) {
  await connectDB();
  if (amount <= 0) {
    throw new Error('Debit amount must be greater than 0');
  }

  const wallet = await getOrCreateWallet(userId);
  const previousTotal = wallet.depositBalance + wallet.winningBalance + wallet.bonusBalance;

  if (previousTotal < amount) {
    const err = new Error(`Insufficient wallet balance. Required ₹${amount}, Available ₹${previousTotal}`);
    err.code = 'INSUFFICIENT_BALANCE';
    err.availableBalance = previousTotal;
    err.requiredAmount = amount;
    throw err;
  }

  let remainingToDebit = amount;

  if (subBalanceType === 'deposit') {
    if (wallet.depositBalance < amount) {
      const err = new Error(`Insufficient deposit balance. Required ₹${amount}, Available ₹${wallet.depositBalance}`);
      err.code = 'INSUFFICIENT_BALANCE';
      throw err;
    }
    wallet.depositBalance -= amount;
  } else if (subBalanceType === 'winning') {
    if (wallet.winningBalance < amount) {
      const err = new Error(`Insufficient winning balance. Required ₹${amount}, Available ₹${wallet.winningBalance}`);
      err.code = 'INSUFFICIENT_BALANCE';
      throw err;
    }
    wallet.winningBalance -= amount;
  } else if (subBalanceType === 'bonus') {
    if (wallet.bonusBalance < amount) {
      const err = new Error(`Insufficient bonus balance. Required ₹${amount}, Available ₹${wallet.bonusBalance}`);
      err.code = 'INSUFFICIENT_BALANCE';
      throw err;
    }
    wallet.bonusBalance -= amount;
  } else {
    // Mixed deduction order: Deposit -> Winnings -> Bonus
    if (wallet.depositBalance >= remainingToDebit) {
      wallet.depositBalance -= remainingToDebit;
      remainingToDebit = 0;
    } else {
      remainingToDebit -= wallet.depositBalance;
      wallet.depositBalance = 0;
    }

    if (remainingToDebit > 0) {
      if (wallet.winningBalance >= remainingToDebit) {
        wallet.winningBalance -= remainingToDebit;
        remainingToDebit = 0;
      } else {
        remainingToDebit -= wallet.winningBalance;
        wallet.winningBalance = 0;
      }
    }

    if (remainingToDebit > 0) {
      if (wallet.bonusBalance >= remainingToDebit) {
        wallet.bonusBalance -= remainingToDebit;
        remainingToDebit = 0;
      } else {
        remainingToDebit -= wallet.bonusBalance;
        wallet.bonusBalance = 0;
      }
    }
  }

  // Ensure no sub-balance falls below 0
  if (wallet.depositBalance < 0 || wallet.winningBalance < 0 || wallet.bonusBalance < 0) {
    throw new Error('Wallet deduction error: Balance cannot be negative');
  }

  await wallet.save();

  const newTotal = wallet.depositBalance + wallet.winningBalance + wallet.bonusBalance;

  const txn = await Transaction.create({
    userId,
    type,
    amount,
    subBalanceType,
    status: 'SUCCESS',
    referenceId,
    description: description || `${type} of ₹${amount}`,
    previousBalance: previousTotal,
    newBalance: newTotal,
    adminId,
    performedBy
  });

  return { wallet, transaction: txn };
}

/**
 * Refund entry fee or transaction back to user deposit wallet
 */
export async function refundWallet({
  userId,
  amount,
  referenceId = '',
  description = ''
}) {
  return creditWallet({
    userId,
    amount,
    type: 'REFUND',
    subBalanceType: 'deposit',
    referenceId,
    description: description || `Refund of ₹${amount} for Room #${referenceId}`
  });
}
