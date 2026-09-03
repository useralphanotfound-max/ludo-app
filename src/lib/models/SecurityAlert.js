import mongoose from 'mongoose';

const securityAlertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  username: { type: String, default: 'System' },
  type: {
    type: String,
    enum: [
      'FAILED_LOGIN_SPIKE',
      'SUSPICIOUS_WITHDRAWAL',
      'MULTI_ACCOUNT_DEVICE',
      'SHARED_IP_CLUSTER',
      'ABNORMAL_TRANSACTION',
      'API_ABUSE',
      'UNUSUAL_GAME_PATTERN'
    ],
    required: true,
    index: true
  },
  severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM', index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  ipAddress: { type: String, default: 'N/A' },
  deviceId: { type: String, default: 'N/A' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  isResolved: { type: Boolean, default: false, index: true },
  resolvedBy: { type: String, default: null },
  resolvedAt: { type: Date, default: null }
}, { timestamps: true });

securityAlertSchema.index({ createdAt: -1 });

export const SecurityAlert = mongoose.models.SecurityAlert || mongoose.model('SecurityAlert', securityAlertSchema);
