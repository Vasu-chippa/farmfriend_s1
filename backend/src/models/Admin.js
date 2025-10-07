import mongoose from "mongoose";

const agentSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    role: { type: String, default: "agent" },
  },
  { timestamps: true }
);

export default mongoose.model("Agent", agentSchema);
