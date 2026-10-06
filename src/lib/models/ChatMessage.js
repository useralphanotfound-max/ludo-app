import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  senderRole: { type: String, enum: ['PLAYER', 'ADMIN'], required: true, default: 'PLAYER' },
  text: { type: String, required: true, maxlength: 500, trim: true },
  isRead: { type: Boolean, default: false, index: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

chatMessageSchema.index({ userId: 1, createdAt: -1 });

export const ChatMessage = mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema);
