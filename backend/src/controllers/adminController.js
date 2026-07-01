import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Transaction from "../models/Transaction.js";
import PlatformWallet from "../models/PlatformWallet.js";
import Region from "../models/Region.js";
import Wallet from "../models/Wallet.js";
import bcrypt from "bcryptjs";

// 📊 Dashboard Summary
export const getDashboardData = async (req, res) => {
  try {
    // Basic user/product/order counts
    const [users, farmers, buyers, agents, ordersCount, productsCount] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "farmer" }),
      User.countDocuments({ role: "buyer" }),
      User.countDocuments({ role: "agent" }),
      Order.countDocuments(),
      Product.countDocuments(),
    ]);

    // Revenue and commission from Transaction collection
    const revenueAgg = await Transaction.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$grossAmount' }, totalCommission: { $sum: '$commissionAmount' } } },
    ]);
    const revenueData = revenueAgg[0] || { totalRevenue: 0, totalCommission: 0 };

    // Top regions by sales
    const topRegionsAgg = await Transaction.aggregate([
      { $match: { status: 'Completed', 'regionSnapshot.name': { $exists: true } } },
      { $group: { _id: '$regionSnapshot.name', sold: { $sum: '$grossAmount' }, count: { $sum: 1 } } },
      { $sort: { sold: -1 } },
      { $limit: 10 },
    ]);

    // Top crops by sales (join via Order.product -> Product.name)
    const topCropsAgg = await Order.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: '$product', soldAmount: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { soldAmount: -1 } },
      { $limit: 10 },
    ]);

    // Platform wallet summary
    const platformWallet = (await PlatformWallet.findOne()) || null;

    // Wallet stats
    const walletsSummary = await Wallet.aggregate([
      { $group: { _id: null, totalCurrent: { $sum: '$currentBalance' }, totalPending: { $sum: '$pendingBalance' }, totalWithdrawn: { $sum: '$withdrawn' } } }
    ]);

    // Recent transactions
    const recentTransactions = await Transaction.find().sort({ transactionDate: -1 }).limit(20).populate('orderId buyerId farmerId');

    res.json({
      users,
      farmers,
      buyers,
      agents,
      orders: ordersCount,
      products: productsCount,
      revenue: revenueData.totalRevenue,
      commission: revenueData.totalCommission,
      topRegions: topRegionsAgg,
      topCrops: topCropsAgg,
      platformWallet,
      walletsSummary: walletsSummary[0] || {},
      recentTransactions,
    });
  } catch (err) {
    res.status(500).json({ message: "Error loading dashboard", error: err.message });
  }
};

// 👥 Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
};
export const getAllFarmers = async (req, res) => {
  try {
    const farmers = await User.find({ role: "farmer" }).select("-password");
    res.json(farmers);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch farmers", error: err.message });
  }
};

// 👨‍🌾 Farmers CRUD
export const getFarmers = async (req, res) => {
  try {
    const farmers = await User.find({ role: "farmer" }).select("-password");
    res.json(farmers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching farmers", error: err.message });
  }
};

export const addFarmer = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Farmer already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const farmer = new User({ fullName, email, password: hashedPassword, role: "farmer" });
    await farmer.save();
    res.status(201).json({ message: "Farmer added successfully", farmer });
  } catch (err) {
    res.status(500).json({ message: "Error adding farmer", error: err.message });
  }
};

export const updateFarmer = async (req, res) => {
  try {
    const farmer = await User.findOneAndUpdate(
      { _id: req.params.id, role: "farmer" },
      req.body,
      { new: true }
    );
    if (!farmer) return res.status(404).json({ message: "Farmer not found" });
    res.json({ message: "Farmer updated successfully", farmer });
  } catch (err) {
    res.status(500).json({ message: "Error updating farmer", error: err.message });
  }
};

export const deleteFarmer = async (req, res) => {
  try {
    const farmer = await User.findOneAndDelete({ _id: req.params.id, role: "farmer" });
    if (!farmer) return res.status(404).json({ message: "Farmer not found" });
    res.json({ message: "Farmer deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting farmer", error: err.message });
  }
};

// 🧑‍💼 Agents
export const getAllAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: "agent" }).select("-password");
    res.json(agents);
  } catch (err) {
    res.status(500).json({ message: "Error fetching agents", error: err.message });
  }
};

export const addAgent = async (req, res) => {
  try {
    const { fullName, email, password, phone, region } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Agent already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const agent = new User({ fullName, email, password: hashedPassword, phone, region, role: "agent" });
    await agent.save();
    res.status(201).json({ message: "Agent added successfully", agent });
  } catch (err) {
    res.status(500).json({ message: "Error adding agent", error: err.message });
  }
};

export const deleteAgent = async (req, res) => {
  try {
    const agent = await User.findOneAndDelete({ _id: req.params.id, role: "agent" });
    if (!agent) return res.status(404).json({ message: "Agent not found" });
    res.json({ message: "Agent deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting agent", error: err.message });
  }
};

// 👤 Buyers
export const getAllBuyers = async (req, res) => {
  try {
    const buyers = await User.find({ role: "buyer" }).select("-password");
    res.json(buyers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching buyers", error: err.message });
  }
};

export const addBuyer = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Buyer already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const buyer = new User({ fullName, email, password: hashedPassword, role: "buyer" });
    await buyer.save();
    res.status(201).json({ message: "Buyer added successfully", buyer });
  } catch (err) {
    res.status(500).json({ message: "Error adding buyer", error: err.message });
  }
};

export const deleteBuyer = async (req, res) => {
  try {
    const buyer = await User.findOneAndDelete({ _id: req.params.id, role: "buyer" });
    if (!buyer) return res.status(404).json({ message: "Buyer not found" });
    res.json({ message: "Buyer deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting buyer", error: err.message });
  }
};

// 📦 Orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("buyer", "fullName email")
      .populate("product", "name price");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders", error: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    if (status === "Confirmed") order.approved = true;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ message: "Error updating order", error: err.message });
  }
};

// 💳 Payments
export const getAllPayments = async (req, res) => {
  try {
    const orders = await Order.find({ "payment.status": { $exists: true } })
      .populate("buyer", "fullName email")
      .populate({
        path: "product",
        populate: { path: "farmer", select: "fullName email" },
      });

    const payments = orders.map((o) => ({
      orderId: o._id,
      buyer: o.buyer,
      farmer: o.product?.farmer,
      productName: o.product?.name,
      transactionId: o.payment?.transactionId,
      paymentDate: o.payment?.paymentDate,
      paymentAmount: o.payment?.amount,
      paymentStatus: o.payment?.status,
      paymentMethod: o.payment?.method,
      notes: o.payment?.notes,
    }));

    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching payments", error: err.message });
  }
};

// 🌾 Products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("farmer", "fullName email");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching products", error: err.message });
  }
};

export const approveProduct = async (req, res) => {
  try {
    const { approved } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { approved },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product approval updated", product });
  } catch (err) {
    res.status(500).json({ message: "Error approving product", error: err.message });
  }
};

export const addProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, quality, organic, farmerId } = req.body;
    const product = new Product({
      name,
      description,
      price,
      quantity,
      quality,
      isOrganic: organic === "true" || organic === true,
      farmer: farmerId, // Admin can specify which farmer owns this
    });
    await product.save();
    res.status(201).json({ message: "Product added successfully", product });
  } catch (err) {
    res.status(500).json({ message: "Error adding product", error: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting product", error: err.message });
  }
};

// 📈 Admin reports
export const getReports = async (req, res) => {
  try {
    // Total completed orders (sold)
    const completedCount = await Order.countDocuments({ status: "Completed" });

    // Pending orders (not completed and not cancelled)
    const pendingCount = await Order.countDocuments({ status: { $in: ["Ordered", "Packed", "Shipped"] } });

    // Total revenue from paid payments
    const paidOrders = await Order.find({ "payment.status": "Paid" }).lean();

    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.payment?.amount ?? o.total ?? 0), 0);

    // Commission (use 5% as platform commission placeholder)
    const commissionRate = 0.05;
    const commissionEarned = totalRevenue * commissionRate;

    res.json({
      totalSold: completedCount,
      pendingOrders: pendingCount,
      revenue: totalRevenue,
      commission: commissionEarned,
      commissionRate,
    });
  } catch (err) {
    res.status(500).json({ message: "Error generating reports", error: err.message });
  }
};
