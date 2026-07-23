import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  depositBalance: { type: Number, default: 0 },
  winningBalance: { type: Number, default: 0 },
  bonusBalance: { type: Number, default: 0 },
  lockedBalance: { type: Number, default: 0 },
  pendingBalance: { type: Number, default: 0 },
  version: { type: Number, default: 1 }
}, { timestamps: true });

walletSchema.virtual('totalBalance').get(function () {
  return this.depositBalance + this.winningBalance + this.bonusBalance;
});

walletSchema.set('toJSON', { virtuals: true });
walletSchema.set('toObject', { virtuals: true });

export const Wallet = mongoose.models.Wallet || mongoose.model('Wallet', walletSchema);
