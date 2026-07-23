import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: ['DEPOSIT', 'WITHDRAWAL', 'MATCH_ENTRY', 'MATCH_WIN', 'REFUND', 'BONUS_CREDIT', 'MANUAL_ADJUSTMENT'],
    required: true
  },
  amount: { type: Number, required: true },
  subBalanceType: { type: String, enum: ['deposit', 'winning', 'bonus', 'locked', 'mixed'], default: 'deposit' },
  status: { type: String, enum: ['INITIATED', 'SUCCESS', 'FAILED', 'PENDING_APPROVAL'], default: 'SUCCESS' },
  referenceId: { type: String, default: '' },
  gatewayReferenceId: { type: String, default: '' },
  description: { type: String, default: '' },
  performedBy: { type: String, default: 'system' }
}, { timestamps: true });

export const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
