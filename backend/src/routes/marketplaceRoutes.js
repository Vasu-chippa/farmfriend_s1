// backend/src/routes/marketplaceRoutes.js
import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

/**
 * @route   GET /api/marketplace
 * @desc    Get all products (for buyers)
 */
router.get("/", async (req, res) => {
  try {
    // Only show products with quantity > 0 (available)
    const products = await Product.find({ quantity: { $gt: 0 } })
      .populate("farmer", "name email")
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
    const product = await Product.findById(req.params.id).populate("farmer", "name email");
    if (!product) return res.status(404).json({ error: "❌ Product not found" });
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "❌ Failed to fetch product" });
  }
});

export default router;
