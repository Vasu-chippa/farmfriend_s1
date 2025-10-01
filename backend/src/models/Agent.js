// apps/backend/src/models/Agent.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const agentSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  region: { type: String },
  commissionEarned: { type: Number, default: 0 },
  role: { type: String, default: "agent" },
  createdAt: { type: Date, default: Date.now },
});

// Hash password when saving (only if modified)
agentSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// method to compare password
agentSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("Agent", agentSchema);
