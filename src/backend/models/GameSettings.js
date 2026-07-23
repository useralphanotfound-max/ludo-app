import mongoose from 'mongoose';

const gameSettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'global_settings', unique: true },
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

export const GameSettings = mongoose.model('GameSettings', gameSettingsSchema);
