import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  images: { type: [String], default: [] },
  meta: { type: Object }
}, { timestamps: true });

reviewSchema.index({ reviewee: 1 });

export default mongoose.model('Review', reviewSchema);
