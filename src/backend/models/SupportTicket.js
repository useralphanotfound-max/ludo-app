import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  subject: { type: String, required: true },
  category: { type: String, enum: ['payment', 'match-dispute', 'account', 'other'], default: 'other' },
  status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], default: 'OPEN' },
  messages: [{
    sender: { type: String, enum: ['USER', 'ADMIN'], required: true },
    senderName: { type: String },
    text: { type: String, required: true },
    attachmentUrl: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
