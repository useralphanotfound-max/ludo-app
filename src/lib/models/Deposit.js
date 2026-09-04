import mongoose from 'mongoose';

const depositSchema = new mongoose.Schema({
  depositId: { type: String, required: true, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true },
  adminUpiId: { type: String, required: true },
  adminQrImageUrl: { type: String, required: true },
  utrNumber: { type: String, default: null, index: true },
  status: { type: String, enum: ['INITIATED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'EXPIRED'], default: 'INITIATED', index: true },
  expiresAt: { type: Date, required: true },
  rejectionReason: { type: String, default: null },
  approvedAt: { type: Date, default: null },
  performedBy: { type: String, default: 'USER' }
}, { timestamps: true });

depositSchema.index({ createdAt: -1 });

export const Deposit = mongoose.models.Deposit || mongoose.model('Deposit', depositSchema);
