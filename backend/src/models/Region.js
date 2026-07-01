import mongoose from 'mongoose';

const regionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  meta: { type: Object }
}, { timestamps: true });

regionSchema.index({ slug: 1 });

export default mongoose.model('Region', regionSchema);
