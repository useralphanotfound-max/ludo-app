import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  opponentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  gameMode: { type: String, enum: ['CLASSIC'], default: 'CLASSIC' },
  playerCount: { type: Number, enum: [2], default: 2 },
  entryFee: { type: Number, required: true },
  prizePool: { type: Number, required: true },
  platformCommission: { type: Number, required: true },
  roomCode: { type: String, required: true, unique: true },
  isPrivate: { type: Boolean, default: false },
  status: { type: String, enum: ['WAITING', 'MATCHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED'], default: 'WAITING', index: true },
  joinedPlayers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  expiresAt: { type: Date, required: true },
  refundedAt: { type: Date, default: null }
}, { timestamps: true });

roomSchema.index({ createdAt: -1 });

export const Room = mongoose.models.Room || mongoose.model('Room', roomSchema);
