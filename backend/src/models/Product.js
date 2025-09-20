// backend/src/models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    quality: { type: String },
    isOrganic: { type: Boolean, default: false },
    images: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
