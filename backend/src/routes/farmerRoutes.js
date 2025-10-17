// backend/src/routes/farmerRoutes.js
import express from "express";
import upload from "../middlewares/upload.js";
import Product from "../models/Product.js";
import Expense from "../models/Expense.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* =====================================================
   FARMER PRODUCTS CRUD
===================================================== */

/**
 * @route   POST /api/farmers/products
 * @desc    Add new product (farmer only)
 */
router.post("/products", protect, authorizeRoles("farmer"), upload.array("images"), async (req, res) => {
  try {
    const { name, description, price, quantity, quality, organic } = req.body;
    // Save all uploaded images
    const images = req.files?.length > 0 ? req.files.map(f => "/uploads/" + f.filename) : [];

    const product = new Product({
      farmer: req.user._id,
      name,
      description,
      price,
      quantity,
      quality,
      isOrganic: organic === "true" || organic === true,
      images,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error("❌ Error saving product:", err);
    res.status(500).json({ error: "Error saving product" });
  }
});

/**
 * @route   GET /api/farmers/products
 * @desc    Fetch all products of logged-in farmer
 */
router.get("/products", protect, authorizeRoles("farmer"), async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.user._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

/**
 * @route   GET /api/farmers/products/:id
 * @desc    Fetch single product details (farmer only)
 */
router.get("/products/:id", protect, authorizeRoles("farmer"), async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, farmer: req.user._id });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error("❌ Error fetching product:", err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

/**
 * @route   PUT /api/farmers/products/:id
 * @desc    Update product (farmer only)
 */
router.put("/products/:id", protect, authorizeRoles("farmer"), upload.array("images"), async (req, res) => {
  try {
    const { name, description, price, quantity, quality, organic } = req.body;
    const updateData = { name, description, price, quantity, quality, isOrganic: organic === "true" || organic === true };
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(f => "/uploads/" + f.filename);
    }
    const updated = await Product.findOneAndUpdate(
      { _id: req.params.id, farmer: req.user._id },
      updateData,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Product not found" });
    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating product:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

/**
 * @route   DELETE /api/farmers/products/:id
 * @desc    Delete product (farmer only)
 */
router.delete("/products/:id", protect, authorizeRoles("farmer"), async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({ _id: req.params.id, farmer: req.user._id });
    if (!deleted) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "🗑️ Product deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting product:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

/* =====================================================
   FARMER EXPENSES CRUD
===================================================== */

/**
 * @route   POST /api/farmers/expenses
 * @desc    Add a new expense (farmer only)
 */
// backend/src/routes/farmerRoutes.js
router.post("/expenses", protect, authorizeRoles("farmer"), async (req, res) => {
  try {
    const { cropName, category, amount, date, description } = req.body;

    const expense = new Expense({
      farmer: req.user._id,   // 👈 save logged-in farmer
      cropName,
      category,
      amount,
      date,
      description,
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ error: "Failed to add expense" });
  }
});


/**
 * @route   GET /api/farmers/expenses
 * @desc    Fetch all expenses of logged-in farmer
 */
router.get("/expenses", protect, authorizeRoles("farmer"), async (req, res) => {
  try {
    const expenses = await Expense.find({ farmer: req.user._id }).sort({ date: -1 }); // 👈 only this farmer
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

/**
 * @route   PUT /api/farmers/expenses/:id
 */
router.put("/expenses/:id", protect, authorizeRoles("farmer"), async (req, res) => {
  try {
    const updated = await Expense.findOneAndUpdate(
      { _id: req.params.id, farmer: req.user._id }, // 👈 only update own expenses
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Expense not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update expense" });
  }
});


/**
 * @route   DELETE /api/farmers/expenses/:id
 */
router.delete("/expenses/:id", protect, authorizeRoles("farmer"), async (req, res) => {
  try {
    const deleted = await Expense.findOneAndDelete({ _id: req.params.id, farmer: req.user._id }); // 👈 only own
    if (!deleted) return res.status(404).json({ error: "Expense not found" });
    res.json({ message: "Expense deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

/**
 * @route   GET /api/farmers/stats
 * @desc    Get dashboard stats for logged-in farmer
 */
router.get("/stats", protect, authorizeRoles("farmer"), async (req, res) => {
  try {
    const farmerId = req.user._id;
    // Total Crops created by farmer
    const totalCrops = await Product.countDocuments({ farmer: farmerId });
    // Harvest crops count
    const harvest = await Harvest.findOne({ farmer: farmerId });
    const totalHarvest = harvest ? harvest.crops.length : 0;
    // Farmer’s expenses
    const expenses = await Expense.find({ farmer: farmerId });
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    // Total Income from harvest
    const totalIncome = harvest
      ? harvest.crops.reduce((sum, c) => sum + (c.price || 0) * (c.quantity || 0), 0)
      : 0;
    // Profit or Loss
    const profitOrLoss = totalIncome - totalExpenses;
    res.json({
      totalCrops,
      totalHarvest,
      totalExpenses,
      totalIncome,
      profitOrLoss,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});


export default router;
