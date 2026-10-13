// ✅ Marketplace products (for buyers)
// backend/src/routes/buyerRoutes.js
import express from "express";
import {
  registerBuyer,
  loginBuyer,
  getBuyerProfile,
  updateBuyerProfile,
} from "../controllers/buyerController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { body } from "express-validator";
import { handleValidation } from "../middlewares/validationMiddleware.js";
import { authRateLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();


// Buyer registration + login
router.post(
  "/register",
  authRateLimiter,
  [
    body("fullName").trim().isLength({ min: 3 }).withMessage("Full name required"),
    body("email").trim().isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  handleValidation,
  registerBuyer
);
router.post(
  "/login",
  authRateLimiter,
  [body("email").trim().isEmail().normalizeEmail(), body("password").isLength({ min: 1 })],
  handleValidation,
  loginBuyer
);

// Buyer profile
router.get("/profile", protect, authorizeRoles("buyer"), getBuyerProfile);
router.put("/profile", protect, authorizeRoles("buyer"), updateBuyerProfile);



// Get all orders for buyer
router.get("/orders", protect, authorizeRoles("buyer"), async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate("product")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get single order by id (buyer only)
router.get("/orders/:id", protect, authorizeRoles("buyer"), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("product").populate("buyer", "fullName email");
    if (!order) return res.status(404).json({ error: "Order not found" });
    // support both populated `buyer` object and raw ObjectId
    const buyerId = order.buyer && order.buyer._id ? String(order.buyer._id) : String(order.buyer);
    if (buyerId !== String(req.user._id)) return res.status(403).json({ error: "Access denied" });
    res.json(order);
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// Cancel order
router.put("/orders/:id/cancel", protect, authorizeRoles("buyer"), async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, buyer: req.user._id });
    if (!order || order.status !== "Ordered") {
      return res.status(400).json({ error: "Order cannot be cancelled" });
    }

    order.status = "Cancelled";
    await order.save();

    const product = await Product.findById(order.product);
    if (product) {
      product.quantity += order.quantity;
      await product.save();
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to cancel order" });
  }
});

import Crop from "../models/Crop.js";

// ✅ Marketplace crops for buyers
/// ✅ Marketplace products for buyers
router.get("/products", async (req, res) => {
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
  } catch (err) {
    console.error("❌ Error fetching products for buyer:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});




// updtae 
// Update order quantity
router.put("/orders/:id", protect, authorizeRoles("buyer"), async (req, res) => {
  try {
    const { quantity } = req.body;
    const order = await Order.findOne({ _id: req.params.id, buyer: req.user._id });

    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.status !== "Ordered") {
      return res.status(400).json({ error: "Only pending orders can be updated" });
    }

    // Adjust product stock
    const product = await Product.findById(order.product);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Rollback previous qty first
    product.quantity += order.quantity;

    if (product.quantity < quantity) {
      return res.status(400).json({ error: "Not enough stock available" });
    }

    order.quantity = quantity;
    order.total = order.price * quantity;

    // Deduct new qty
    product.quantity -= quantity;

    await order.save();
    await product.save();

    res.json(order);
  } catch (err) {
    console.error("❌ Error updating order:", err);
    res.status(500).json({ error: "Failed to update order" });
  }
});

// Delete order
router.delete("/orders/:id", protect, authorizeRoles("buyer"), async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, buyer: req.user._id });
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (order.status === "Ordered") {
      // restore product stock
      const product = await Product.findById(order.product);
      if (product) {
        product.quantity += order.quantity;
        await product.save();
      }
    }

    await order.deleteOne();
    res.json({ message: "✅ Order deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting order:", err);
    res.status(500).json({ error: "Failed to delete order" });
  }
});
// Place order
router.post("/orders", protect, authorizeRoles("buyer"), async (req, res) => {
  try {
    const { productId, quantity, paymentMethod } = req.body; // ✅ added paymentMethod
    const requestedQuantity = Number(quantity);
    if (!Number.isFinite(requestedQuantity) || requestedQuantity <= 0) {
      return res.status(400).json({ error: "Quantity must be greater than zero" });
    }

    // populate farmer so we can inherit region information
    const verifiedFarmerIds = await User.distinct("_id", { role: "farmer", verified: true });
    const product = await Product.findOneAndUpdate(
      {
        _id: productId,
        approved: true,
        quantity: { $gte: requestedQuantity },
        farmer: { $in: verifiedFarmerIds },
      },
      { $inc: { quantity: -requestedQuantity } },
      { new: true }
    ).populate('farmer');
    if (!product) {
      return res.status(400).json({ error: "Insufficient stock or product not found" });
    }

    const price = product.price;
    const total = price * requestedQuantity;

    // Generate transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // ✅ create the order with payment info
    const orderPayload = {
      buyer: req.user._id,
      product: product._id,
      quantity: requestedQuantity,
      price,
      total,
      status: "Ordered",
      approved: false,
      payment: {
        method: paymentMethod || "Other",
        status: "Paid",
        transactionId,
        paymentDate: new Date(),
        amount: total,
        notes: "Auto payment success simulation",
      },
    };

    // Inherit region information from product.farmer if available
    try {
      const farmer = product.farmer;
      if (farmer && farmer.regionId) {
        orderPayload.regionId = farmer.regionId;
        orderPayload.regionSnapshot = { name: farmer.region || undefined, id: farmer.regionId };
      }
    } catch (e) {
      // ignore
    }

    const order = new Order(orderPayload);
    try {
      await order.save();
    } catch (error) {
      await Product.updateOne({ _id: product._id }, { $inc: { quantity: requestedQuantity } });
      throw error;
    }

    res.status(201).json(order);
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({ error: "Failed to place order" });
  }
});

export default router;
