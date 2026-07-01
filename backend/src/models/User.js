// backend/src/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["farmer", "buyer", "agent", "admin"],
      default: "farmer",
    },
    verified: { type: Boolean, default: false },
    // Profile fields
    phone: { type: String },
    district: { type: String },
    region: { type: String },
    state: { type: String },
    village: { type: String },
    pincode: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    address: { type: String },
    profileImage: { type: String },
    experience: { type: String },
    farmSize: { type: String },
    preferredCrops: { type: [String], default: [] },
    verificationStatus: { type: String, default: 'pending' },
    regionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Region' },
    // Farmer specific
    age: { type: Number },
    // Buyer specific
    company: { type: String },
    // Agent specific
    assignedRegion: { type: String },
    commissionEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Note: geographic coordinates are stored as `latitude` and `longitude` fields.

export default mongoose.model("User", userSchema);
