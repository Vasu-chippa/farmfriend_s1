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

const router = express.Router();


// Buyer registration + login
router.post("/register", registerBuyer);
router.post("/login", loginBuyer);

// Buyer profile
router.get("/profile", protect, authorizeRoles("buyer"), getBuyerProfile);
router.put("/profile", protect, authorizeRoles("buyer"), updateBuyerProfile);

// Place order
router.post("/orders", protect, authorizeRoles("buyer"), async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product || product.quantity < quantity) {
      return res.status(400).json({ error: "Insufficient stock or product not found" });
    }

    const price = product.price;
    const total = price * quantity;

    const order = new Order({
      buyer: req.user._id,
      product: product._id,
      quantity,
      price,
      total,
      status: "Pending",
    });

    await order.save();

    product.quantity -= quantity;
    await product.save();

    res.status(201).json(order);
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({ error: "Failed to place order" });
  }
});

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

// Cancel order
router.put("/orders/:id/cancel", protect, authorizeRoles("buyer"), async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, buyer: req.user._id });
    if (!order || order.status !== "Pending") {
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
    const products = await Product.find()
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
    if (order.status !== "Pending") {
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

    if (order.status === "Pending") {
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
    const product = await Product.findById(productId);
    if (!product || product.quantity < quantity) {
      return res.status(400).json({ error: "Insufficient stock or product not found" });
    }

    const price = product.price;
    const total = price * quantity;

    // Generate transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // ✅ create the order with payment info
    const order = new Order({
      buyer: req.user._id,
      product: product._id,
      quantity,
      price,
      total,
      status: "Pending",
      approved: false,
      payment: {
        method: paymentMethod || "Other",
        status: "Paid",
        transactionId,
        paymentDate: new Date(),
        amount: total,
        notes: "Auto payment success simulation",
      },
    });

    await order.save();

    product.quantity -= quantity;
    await product.save();

    res.status(201).json(order);
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({ error: "Failed to place order" });
  }
});

export default router;
