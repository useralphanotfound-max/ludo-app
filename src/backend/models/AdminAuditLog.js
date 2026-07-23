import mongoose from 'mongoose';

const adminAuditLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminUsername: { type: String, required: true },
  action: {
    type: String,
    enum: [
      'ADMIN_LOGIN',
      'ADMIN_LOGOUT',
      'RESOLVE_DISPUTE',
      'APPROVE_WITHDRAWAL',
      'REJECT_WITHDRAWAL',
      'WALLET_MANUAL_ADJUSTMENT',
      'BAN_USER',
      'UNBAN_USER',
      'UPDATE_SETTINGS',
      'REPLY_TICKET'
    ],
    required: true
  },
  targetEntity: { type: String, default: '' },
  targetId: { type: String, default: '' },
  details: { type: String, default: '' },
  diff: { type: mongoose.Schema.Types.Mixed, default: {} },
  ipAddress: { type: String, required: true },
  userAgent: { type: String, default: '' }
}, { timestamps: true });

export const AdminAuditLog = mongoose.model('AdminAuditLog', adminAuditLogSchema);
