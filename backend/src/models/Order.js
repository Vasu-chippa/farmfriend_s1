import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }, // price per unit at time of order
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
