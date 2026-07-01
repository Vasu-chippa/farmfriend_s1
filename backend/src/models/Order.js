import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ["Credit Card", "UPI", "PayPal", "Bank Transfer", "Other"],
      default: "Other",
    },
    status: {
      type: String,
      enum: ["Paid", "Unpaid", "Refunded"],
      default: "Unpaid",
    },
    transactionId: { type: String },
    paymentDate: { type: Date },
    amount: { type: Number },
    notes: { type: String },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }, // price per unit at order time
    total: { type: Number, required: true },

    // Commission breakdown (optional)
    commissionPercent: { type: Number, default: 5 },
    commissionAmount: { type: Number, default: 0 },
    farmerAmount: { type: Number, default: 0 },
    platformAmount: { type: Number, default: 0 },

    // --- Updated fields ---
    status: {
      type: String,
      enum: [
        "Ordered",
        "Packed",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Completed",
      ],
      default: "Ordered",
    },
    approved: {
      type: Boolean,
      default: false,
    },

    // Region snapshot and canonical reference
    regionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Region' },
    regionSnapshot: { type: Object },

    // Payment subdocument
    payment: paymentSchema,
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
