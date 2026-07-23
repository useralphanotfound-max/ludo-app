import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema({
  matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  player1: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: { type: String },
    claimedResult: { type: String, enum: ['WON', 'LOST', 'NONE'], default: 'WON' },
    screenshotUrl: { type: String, default: '' },
    submittedAt: { type: Date, default: Date.now }
  },
  player2: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: { type: String },
    claimedResult: { type: String, enum: ['WON', 'LOST', 'NONE'], default: 'WON' },
    screenshotUrl: { type: String, default: '' },
    submittedAt: { type: Date, default: Date.now }
  },
  status: { type: String, enum: ['PENDING_ADMIN_REVIEW', 'RESOLVED_P1_WIN', 'RESOLVED_P2_WIN', 'REFUNDED', 'REJECTED'], default: 'PENDING_ADMIN_REVIEW' },
  resolvedByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  resolvedByAdminUsername: { type: String, default: '' },
  adminNotes: { type: String, default: '' },
  resolvedAt: { type: Date, default: null }
}, { timestamps: true });

export const Dispute = mongoose.models.Dispute || mongoose.model('Dispute', disputeSchema);
