import mongoose from 'mongoose';

const matchResultSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  submittedStatus: { type: String, enum: ['WON', 'LOST', 'CANCELLED'], required: true },
  screenshotUrl: { type: String, default: null },
  reviewStatus: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING', index: true },
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

matchResultSchema.index({ roomId: 1, userId: 1 });

export const MatchResult = mongoose.models.MatchResult || mongoose.model('MatchResult', matchResultSchema);
