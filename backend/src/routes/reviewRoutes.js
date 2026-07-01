
import express from "express";
import Review from "../models/Review.js";
import Order from "../models/Order.js";

const router = express.Router();

// Create review - only verified buyers who have delivered orders can review
router.post("/", async (req, res) => {
  try {
    const { buyer, product, farmer, rating, comment } = req.body;

    // Verify buyer has a completed order for this product
    const hasPurchased = await Order.exists({ buyer, product, status: { $in: ["Delivered", "Completed"] } });
    if (!hasPurchased) return res.status(403).json({ error: "Only verified buyers who purchased can review." });

    const review = await Review.create({ buyer, product, farmer, rating, comment, verifiedPurchase: true });
    res.status(201).json(review);
  } catch (err) {
    console.error("Error creating review:", err);
    res.status(500).json({ error: "Failed to create review" });
  }
});

// Get reviews for a product
router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate("buyer", "fullName");
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

export default router;
