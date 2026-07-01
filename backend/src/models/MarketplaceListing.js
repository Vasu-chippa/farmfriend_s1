import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  harvestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Harvest' },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cropId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
  title: { type: String },
  description: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  images: { type: [String], default: [] },
  regionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Region' },
  isActive: { type: Boolean, default: true },
  removedAt: { type: Date, default: null },
  commissionPercent: { type: Number, default: 5 },
}, { timestamps: true });

listingSchema.index({ farmer: 1, cropId: 1 });

export default mongoose.model('MarketplaceListing', listingSchema);
