import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  taskId: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  reward: { type: Number, required: true },
  rewardType: { type: String, enum: ['bonus', 'cash'], default: 'bonus' },
  target: { type: Number, required: true, default: 1 },
  expiresAt: { type: Date, default: null },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const userTaskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  taskId: { type: String, required: true, index: true },
  currentProgress: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  isClaimed: { type: Boolean, default: false },
  claimedAt: { type: Date, default: null }
}, { timestamps: true });

userTaskSchema.index({ userId: 1, taskId: 1 }, { unique: true });

export const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);
export const UserTask = mongoose.models.UserTask || mongoose.model('UserTask', userTaskSchema);
