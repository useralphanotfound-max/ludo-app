import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  mobile: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: true },
  rawPassword: { type: String, default: '' },
  role: { type: String, enum: ['USER', 'ADMIN', 'SUPERADMIN'], default: 'USER', index: true },
  status: { type: String, enum: ['PENDING_VERIFICATION', 'ACTIVE', 'BANNED', 'DELETED'], default: 'ACTIVE', index: true },
  avatarUrl: { type: String, default: 'https://api.dicebear.com/7.x/bottts/svg?seed=royal_ludo' },
  referralCode: { type: String, required: true, unique: true },
  referredBy: { type: String, default: null },
  deviceId: { type: String, default: 'dev-device-1' },
  deviceType: { type: String, enum: ['android', 'ios', 'web'], default: 'android' },
  appVersion: { type: String, default: '1.0.0' },
  fcmToken: { type: String, default: '' },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  stats: {
    played: { type: Number, default: 0 },
    won: { type: Number, default: 0 },
    lost: { type: Number, default: 0 },
    totalWinningsPaise: { type: Number, default: 0 }
  },
  kycStatus: { type: String, enum: ['NONE', 'PENDING', 'VERIFIED', 'REJECTED'], default: 'VERIFIED', index: true },
  riskScore: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW', index: true },
  isWalletFrozen: { type: Boolean, default: false, index: true },
  failedLoginAttempts: { type: Number, default: 0 },
  lockoutUntil: { type: Date, default: null },
  otpSecret: { type: String, default: null },
  is2FAEnabled: { type: Boolean, default: false },
  lastLoginAt: { type: Date, default: Date.now },
  lastLoginIp: { type: String, default: '127.0.0.1' }
}, { timestamps: true });

userSchema.index({ createdAt: -1 });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
