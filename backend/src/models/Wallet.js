import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  currentBalance: { type: Number, default: 0 },
  pendingBalance: { type: Number, default: 0 },
  withdrawn: { type: Number, default: 0 },
  lifetimeEarnings: { type: Number, default: 0 },
}, { timestamps: { createdAt: true, updatedAt: 'updatedAt' } });

walletSchema.index({ userId: 1 });

export default mongoose.model('Wallet', walletSchema);
