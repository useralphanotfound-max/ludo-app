import mongoose from 'mongoose';

const depositSchema = new mongoose.Schema({
  depositId: { type: String, required: true, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'UPI' }, // 'UPI', 'QR_CODE', etc.
  paymentMethodTitle: { type: String, default: 'UPI Direct Transfer' },
  paymentMethodId: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentMethod', default: null },
  adminUpiId: { type: String, default: 'royalludo@upi' },
  adminQrImageUrl: { type: String, default: '' },
  utrNumber: { type: String, default: null, index: true },
  proofImageUrl: { type: String, default: null },
  status: { type: String, enum: ['INITIATED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'EXPIRED'], default: 'INITIATED', index: true },
  expiresAt: { type: Date, required: true },
  rejectionReason: { type: String, default: null },
  approvedAt: { type: Date, default: null },
  performedBy: { type: String, default: 'USER' }
}, { timestamps: true });

depositSchema.index({ createdAt: -1 });

if (mongoose.models.Deposit) {
  delete mongoose.models.Deposit;
}

export const Deposit = mongoose.model('Deposit', depositSchema);
