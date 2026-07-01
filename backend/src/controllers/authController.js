import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// @desc    Register a new user (farmer, buyer, agent, admin)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, role, landSize } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role,
      regionId: req.body.regionId || undefined,
      district: req.body.district || undefined,
      village: req.body.village || undefined,
      phone: req.body.phone || undefined,
    });

    const token = generateToken(user._id, user.role);
    // Set httpOnly cookie for client to use (no localStorage)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // ✅ Compare entered password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id, user.role);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get current user from token cookie
// @route   GET /api/auth/me
// @access  Private (via cookie or Authorization header)
export const getCurrentUser = async (req, res) => {
  try {
    const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.split(" ")[1]);
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded._id || decoded.id || decoded.userId || decoded.uid;
    const user = await User.findById(userId).select("_id fullName email role");
    if (!user) return res.status(401).json({ message: "User not found" });

    return res.json({ user });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// @desc Logout user (clear cookie)
// @route POST /api/auth/logout
// @access Public
export const logoutUser = async (req, res) => {
  res.clearCookie("token", { path: "/" });
  return res.json({ message: "Logged out" });
};
