import mongoose from 'mongoose';

const paymentMethodSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['UPI', 'QR_CODE', 'BANK_TRANSFER'], default: 'UPI', required: true },
  upiId: { type: String, default: '', trim: true },
  payeeName: { type: String, default: 'Royal Ludo Gaming', trim: true },
  qrImageUrl: { type: String, default: '', trim: true },
  minAmount: { type: Number, default: 50 },
  maxAmount: { type: Number, default: 50000 },
  instructions: { type: String, default: 'Pay via any UPI app and enter the 12-digit UTR transaction ID.' },
  category: { type: String, enum: ['DEPOSIT', 'WITHDRAWAL', 'BOTH'], default: 'DEPOSIT' },
  isActive: { type: Boolean, default: true, index: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

paymentMethodSchema.index({ category: 1, isActive: 1, sortOrder: 1 });

if (mongoose.models.PaymentMethod) {
  delete mongoose.models.PaymentMethod;
}

export const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);
