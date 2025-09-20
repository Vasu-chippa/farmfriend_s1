// backend/src/controllers/buyerController.js
import Buyer from "../models/Buyer.js";
import jwt from "jsonwebtoken";

// ✅ Register Buyer
export const registerBuyer = async (req, res) => {
  try {
    const { fullName, email, password, company } = req.body;
    const existing = await Buyer.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Buyer already exists" });
    }

    const buyer = new Buyer({ fullName, email, password, company });
    await buyer.save();

    const token = jwt.sign(
      { _id: buyer._id, role: buyer.role, email: buyer.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Buyer registered successfully",
      user: buyer,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Error registering buyer", error: err.message });
  }
};

// ✅ Login Buyer
export const loginBuyer = async (req, res) => {
  try {
    const { email, password } = req.body;
    const buyer = await Buyer.findOne({ email, password });
    if (!buyer) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { _id: buyer._id, role: buyer.role, email: buyer.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      user: buyer,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
};

// ✅ Get Buyer Profile
export const getBuyerProfile = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.user._id);
    if (!buyer) return res.status(404).json({ message: "Buyer not found" });
    res.json({ user: buyer });
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile", error: err.message });
  }
};

// ✅ Update Buyer Profile
export const updateBuyerProfile = async (req, res) => {
  try {
    const { fullName, company } = req.body;
    const buyer = await Buyer.findByIdAndUpdate(
      req.user._id,
      { fullName, company },
      { new: true }
    );
    if (!buyer) return res.status(404).json({ message: "Buyer not found" });
    res.json({ message: "Profile updated", user: buyer });
  } catch (err) {
    res.status(500).json({ message: "Error updating profile", error: err.message });
  }
};
