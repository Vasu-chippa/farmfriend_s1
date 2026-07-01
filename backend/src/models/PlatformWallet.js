import mongoose from 'mongoose';

const platformWalletSchema = new mongoose.Schema({
  totalRevenue: { type: Number, default: 0 },
  todayRevenue: { type: Number, default: 0 },
  monthlyRevenue: { type: Number, default: 0 },
  yearlyRevenue: { type: Number, default: 0 },
  commissionHistory: [
    {
      date: { type: Date, default: Date.now },
      amount: { type: Number },
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
      meta: { type: Object },
    },
  ],
}, { timestamps: true });

export default mongoose.model('PlatformWallet', platformWalletSchema);
