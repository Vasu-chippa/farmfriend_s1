import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// @desc    Register a new user (farmer, buyer, agent, admin)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    if (!['farmer', 'buyer'].includes(role || 'farmer')) {
      return res.status(400).json({ message: "Public registration is available for farmers and buyers only" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'farmer',
      regionId: req.body.regionId || undefined,
      district: req.body.district || undefined,
      village: req.body.village || undefined,
      phone: req.body.phone || undefined,
      farmSize: req.body.landSize ? String(req.body.landSize) : undefined,
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
    if (error.code === 11000) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Registration is temporarily unavailable. Please try again shortly." });
    }
    console.error("User registration failed:", error);
    return res.status(500).json({ message: "Registration failed due to a server error" });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // ✅ Compare entered password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    if (role && user.role !== role) {
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
    console.error("User login failed:", error);
    return res.status(500).json({ message: "Login failed due to a server error" });
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
