import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String },
  title: { type: String },
  body: { type: String },
  read: { type: Boolean, default: false },
  channel: { type: String, enum: ['socket','database','email'], default: 'database' },
  meta: { type: Object }
}, { timestamps: true });

notificationSchema.index({ userId: 1, read: 1 });

export default mongoose.model('Notification', notificationSchema);
