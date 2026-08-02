import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  gameMode: { type: String, enum: ['CLASSIC', 'TURBO'], default: 'CLASSIC' },
  playerCount: { type: Number, enum: [2, 4], default: 2 },
  entryFee: { type: Number, required: true },
  roomCode: { type: String, required: true, unique: true },
  isPrivate: { type: Boolean, default: false },
  status: { type: String, enum: ['WAITING', 'MATCHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED'], default: 'WAITING', index: true },
  joinedPlayers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  expiresAt: { type: Date, default: () => new Date(+new Date() + 5 * 60 * 1000) }
}, { timestamps: true });

roomSchema.index({ createdAt: -1 });

export const Room = mongoose.models.Room || mongoose.model('Room', roomSchema);
