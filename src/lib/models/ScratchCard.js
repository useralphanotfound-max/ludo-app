import mongoose from 'mongoose';

const scratchCardSchema = new mongoose.Schema({
  cardId: { type: String, required: true, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, default: 'Lucky Winner' },
  rewardAmount: { type: Number, default: 0 },
  rewardType: { type: String, enum: ['bonus', 'cash', null], default: 'bonus' },
  isScratched: { type: Boolean, default: false, index: true },
  scratchedAt: { type: Date, default: null },
  expiresAt: { type: Date, required: true },
  thumbnailUrl: { type: String, default: 'https://cdn.royalludo.com/scratch/sc_thumb.png' }
}, { timestamps: true });

scratchCardSchema.index({ createdAt: -1 });

export const ScratchCard = mongoose.models.ScratchCard || mongoose.model('ScratchCard', scratchCardSchema);
