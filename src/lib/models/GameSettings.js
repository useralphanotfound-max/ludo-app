import mongoose from 'mongoose';

const gameSettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'global_settings', unique: true },
  roomTimeoutSeconds: { type: Number, default: 45 },
  useDefaultOtp: { type: Boolean, default: true },
  defaultOtpCode: { type: String, default: '1234' },
  otpLength: { type: Number, default: 4 },
  adminUpiId: { type: String, default: 'royalludo@upi' },
  adminUpiQrImageUrl: { type: String, default: 'https://cdn.royalludo.com/qr/admin_upi_qr.png' },
  adminUpiPayeeName: { type: String, default: 'Royal Ludo Gaming' },
  depositTimerMinutes: { type: Number, default: 10 },
  platformCommissionPct: { type: Number, default: 10 },
  minDepositRs: { type: Number, default: 50 },
  maxDepositRs: { type: Number, default: 50000 },
  minWithdrawRs: { type: Number, default: 100 },
  maxWithdrawRs: { type: Number, default: 25000 },
  autoPayoutThresholdRs: { type: Number, default: 1000 },
  referralBonusRs: { type: Number, default: 50 },
  maintenanceMode: { type: Boolean, default: false },
  maintenanceMessage: { type: String, default: 'Royal Ludo is undergoing scheduled maintenance. Back soon!' },
  forceUpdateVersion: { type: String, default: '1.0.0' },
  ludoKingAppUrl: { type: String, default: 'ludoking://play' }
}, { timestamps: true });

export const GameSettings = mongoose.models.GameSettings || mongoose.model('GameSettings', gameSettingsSchema);
