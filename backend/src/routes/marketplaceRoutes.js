
// backend/src/routes/marketplaceRoutes.js
import express from "express";
import Product from "../models/Product.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * @route   GET /api/marketplace
 * @desc    Get all products (for buyers)
 */
router.get("/", async (req, res) => {
  try {
    const verifiedFarmerIds = await User.distinct("_id", { role: "farmer", verified: true });
    const products = await Product.find({
      approved: true,
      quantity: { $gt: 0 },
      farmer: { $in: verifiedFarmerIds },
    })
      .populate("farmer", "fullName email")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Error fetching marketplace products:", error);
    res.status(500).json({ error: "❌ Failed to fetch marketplace products" });
  }
});

/**
 * @route   GET /api/marketplace/:id
 * @desc    Get product details (for buyers)
 */
router.get("/:id", async (req, res) => {
  try {
    const verifiedFarmerIds = await User.distinct("_id", { role: "farmer", verified: true });
    const product = await Product.findOne({
      _id: req.params.id,
      approved: true,
      quantity: { $gt: 0 },
      farmer: { $in: verifiedFarmerIds },
    }).populate("farmer", "fullName email");
    if (!product) return res.status(404).json({ error: "❌ Product not found" });
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "❌ Failed to fetch product" });
  }
});

export default router;
