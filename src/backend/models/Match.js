import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  gameMode: { type: String, default: 'CLASSIC' },
  entryFee: { type: Number, required: true }, // paise
  prizePool: { type: Number, required: true }, // paise
  players: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: { type: String },
    avatarUrl: { type: String }
  }],
  winnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['SEARCHING', 'ACTIVE', 'COMPLETED', 'DISPUTED', 'CANCELLED'], default: 'ACTIVE' },
  startedAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date, default: null }
}, { timestamps: true });

export const Match = mongoose.model('Match', matchSchema);
