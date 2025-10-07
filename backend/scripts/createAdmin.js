import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../src/models/User.js"; // adjust path if needed

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const adminEmail = "chippavasu3@gmail.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("⚠️ Admin user already exists:", adminEmail);
      return process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("VasuSinFarmFriendAdmin", 10);

    const admin = new User({
      fullName: "Vasu S",
      email: adminEmail,
      phone: "9381701606",
      password: hashedPassword,
      role: "admin",
    });

    await admin.save();
    console.log("✅ Admin user created successfully!");
    console.log("🔐 Login Credentials:");
    console.log("Email:", adminEmail);
    console.log("Password: VasuSinFarmFriendAdmin");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    process.exit(1);
  }
};

createAdmin();
