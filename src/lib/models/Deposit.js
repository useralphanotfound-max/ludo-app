import mongoose from 'mongoose';

const depositSchema = new mongoose.Schema({
  depositId: { type: String, required: true, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['UPI', 'NETBANKING', 'CARD', 'WALLET', 'MANUAL_ADMIN'], default: 'UPI' },
  gatewayProvider: { type: String, default: 'RAZORPAY' },
  gatewayReferenceId: { type: String, default: '' },
  status: { type: String, enum: ['PENDING', 'PROCESSING', 'SUCCESSFUL', 'FAILED', 'REVERSED', 'REFUNDED'], default: 'PENDING', index: true },
  webhookVerified: { type: Boolean, default: false },
  failureReason: { type: String, default: null },
  completedAt: { type: Date, default: null },
  performedBy: { type: String, default: 'USER' }
}, { timestamps: true });

depositSchema.index({ createdAt: -1 });

export const Deposit = mongoose.models.Deposit || mongoose.model('Deposit', depositSchema);
