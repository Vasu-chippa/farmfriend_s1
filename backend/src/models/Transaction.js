import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  regionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Region' },
  regionSnapshot: { type: Object },
  grossAmount: { type: Number, required: true },
  commissionAmount: { type: Number, default: 0 },
  farmerAmount: { type: Number, default: 0 },
  paymentMethod: { type: String },
  status: { type: String, enum: ['Pending','Completed','Failed','Refunded'], default: 'Pending' },
  transactionDate: { type: Date, default: Date.now },
  meta: { type: Object }
}, { timestamps: true });

transactionSchema.index({ orderId: 1 });

export default mongoose.model('Transaction', transactionSchema);
