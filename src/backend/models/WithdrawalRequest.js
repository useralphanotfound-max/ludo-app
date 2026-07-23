import mongoose from 'mongoose';

const withdrawalRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  mobile: { type: String, required: true },
  amountPaise: { type: Number, required: true }, // in paise (e.g. 50000 = ₹500)
  payoutMethod: { type: String, enum: ['UPI', 'BANK_TRANSFER'], required: true },
  accountDetails: {
    upiId: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    accountHolderName: { type: String, default: '' }
  },
  status: { type: String, enum: ['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'FAILED'], default: 'PENDING_APPROVAL' },
  riskScore: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' },
  rejectionReason: { type: String, default: '' },
  processedBy: { type: String, default: '' },
  processedAt: { type: Date, default: null }
}, { timestamps: true });

export const WithdrawalRequest = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);
