import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  category: {
    type: String,
    enum: ['payment', 'match_dispute', 'account', 'technical', 'other'],
    required: true
  },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  transactionId: { type: String, default: null },
  roomId: { type: String, default: null },
  status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], default: 'OPEN', index: true },
  estimatedResponse: { type: Date, default: () => new Date(Date.now() + 15 * 60 * 1000) }
}, { timestamps: true });

supportTicketSchema.index({ createdAt: -1 });

export const SupportTicket = mongoose.models.SupportTicket || mongoose.model('SupportTicket', supportTicketSchema);
