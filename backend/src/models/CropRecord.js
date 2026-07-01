import mongoose from "mongoose";

const cropRecordSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cropId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Crop",
      required: true,
    },
    date: { type: Date, required: true },
    cost: { type: Number },
    quantity: { type: Number },
    acres: { type: Number },
    description: { type: String },
    fertilizer: { type: String },
    seeds: { type: Number },
    workers: { type: Number },
    transportCost: { type: Number },
    recordType: { type: String, enum: ['cost', 'activity'], default: 'cost' },
    activityType: { type: String },
    hours: { type: Number },
    amountSpent: { type: Number },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("CropRecord", cropRecordSchema);
