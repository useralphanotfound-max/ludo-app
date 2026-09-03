import mongoose from 'mongoose';

const loginHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  username: { type: String, required: true, index: true },
  role: { type: String, enum: ['USER', 'ADMIN', 'SUPERADMIN'], default: 'USER' },
  status: { type: String, enum: ['SUCCESS', 'FAILED_PASSWORD', 'FAILED_OTP', 'LOCKED_OUT'], required: true },
  ipAddress: { type: String, required: true },
  userAgent: { type: String, default: 'Unknown' },
  deviceId: { type: String, default: 'Unknown' },
  location: { type: String, default: 'India' },
  failureReason: { type: String, default: null }
}, { timestamps: true });

loginHistorySchema.index({ createdAt: -1 });

export const LoginHistory = mongoose.models.LoginHistory || mongoose.model('LoginHistory', loginHistorySchema);
