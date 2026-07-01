import mongoose from "mongoose";

const harvestSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    crops: [
      {
        cropId: { type: mongoose.Schema.Types.ObjectId, ref: "Crop" },
        name: { type: String },
        variety: { type: String },
        farmName: { type: String },
        village: { type: String },
        district: { type: String },
        state: { type: String },
        pincode: { type: String },
        acres: { type: Number },
        price: { type: Number },
        quantity: { type: Number },
        yieldPerAcre: { type: Number },
        image: { type: String },
        category: { type: String },
        quality: { type: String },
        isMarketplaceListed: { type: Boolean, default: false },
        commissionPercent: { type: Number, default: 5 },
        commissionAmount: { type: Number, default: 0 },
        removedAt: { type: Date, default: null },
      },
    ],
  },
  { timestamps: true }
);

// Index commonly queried fields for performance
harvestSchema.index({ 'crops.cropId': 1 });
harvestSchema.index({ farmer: 1 });

export default mongoose.model("Harvest", harvestSchema);
