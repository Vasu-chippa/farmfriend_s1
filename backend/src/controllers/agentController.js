// apps/backend/src/controllers/agentController.js
import Agent from "../models/Agent.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Crop from "../models/Crop.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// =================== AUTH ===================
const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

export const registerAgent = async (req, res) => {
  try {
    const { fullName, email, password, phone, region } = req.body;

    const exists = await Agent.findOne({ email });
    if (exists) return res.status(400).json({ message: "Agent already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const agent = new Agent({
      fullName,
      email,
      password: hashed,
      phone,
      region,
    });

    await agent.save();
    res.status(201).json({ message: "Agent registered successfully", agent });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering agent", error: error.message });
  }
};

export const loginAgent = async (req, res) => {
  try {
    const { email, password } = req.body;
    const agent = await Agent.findOne({ email });

    if (!agent) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, agent.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = signToken({
      _id: agent._id,
      role: "agent",
      email: agent.email,
    });

    const userSafe = {
      _id: agent._id,
      fullName: agent.fullName || "",
      email: agent.email,
      phone: agent.phone,
      region: agent.region,
      role: "agent",
    };

    res.json({ message: "Login successful", token, user: userSafe });
  } catch (err) {
    console.error("loginAgent:", err);
    res.status(500).json({ message: "Error logging in" });
  }
};

// =================== DASHBOARD ===================
export const getAgentDashboard = async (req, res) => {
  try {
    const farmers = await User.countDocuments({ role: "farmer" });
    const crops = await Crop.countDocuments({});
    const pendingOrders = await Order.countDocuments({ status: "Pending" });
    const completedOrders = await Order.countDocuments({ status: "Completed" });

    res.json({
      farmers,
      crops,
      pendingOrders,
      completedOrders,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching agent dashboard",
        error: error.message,
      });
  }
};

// =================== FARMERS ===================
export const getAgentFarmers = async (req, res) => {
  try {
    const farmers = await User.find({ role: "farmer" }).select("-password");
    res.json(farmers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching farmers", error: error.message });
  }
};

export const addFarmerByAgent = async (req, res) => {
  try {
    const { fullName, email, password, phone, age, address } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Farmer already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const farmer = new User({
      fullName,
      email,
      password: hashed,
      role: "farmer",
      phone,
      age,
      address,
    });
    await farmer.save();

    res.status(201).json({ message: "Farmer added successfully", farmer });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding farmer", error: error.message });
  }
};

export const verifyFarmer = async (req, res) => {
  try {
    const { farmerId, verify } = req.body;
    const farmer = await User.findById(farmerId);

    if (!farmer)
      return res.status(404).json({ message: "Farmer not found" });

    farmer.verified = verify;
    await farmer.save();

    res.json({ message: verify ? "Farmer verified" : "Farmer unverified" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error verifying farmer", error: error.message });
  }
};

// =================== PRODUCTS ===================
export const listProductsForAgent = async (req, res) => {
  try {
    const products = await Product.find().populate("farmer", "fullName email");
    res.json(products);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
};

// =================== PRODUCTS ===================
export const approveProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { approve } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.approved = !!approve;
    await product.save();

    // === Add 2% commission to the agent if approved ===
    if (approve) {
      const agent = await Agent.findById(req.user._id);
      const commission = (product.price * product.quantity * 2) / 100;
      agent.commissionEarned += commission;
      await agent.save();
    }

    res.json({
      message: approve
        ? "Product approved and commission added"
        : "Product unapproved",
      product,
    });
  } catch (error) {
    console.error("approveProduct:", error);
    res
      .status(500)
      .json({ message: "Error approving product", error: error.message });
  }
};

// =================== ORDERS ===================
export const getOrdersForAgent = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("buyer", "fullName email")
      .populate({
        path: "product",
        select: "name price farmer",
        populate: { path: "farmer", select: "fullName email" },
      });

    res.json(orders);
  } catch (error) {
    console.error("getOrdersForAgent:", error);
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
};


export const approveOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { approve } = req.body;

    const order = await Order.findById(id).populate("farmer");
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.approved = !!approve;
    await order.save();

    res.json({ message: approve ? "Order approved" : "Order unapproved", order });
  } catch (err) {
    console.error("approveOrder:", err);
    res.status(500).json({ message: "Error approving order" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id).populate("farmer");
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err) {
    console.error("updateOrderStatus:", err);
    res.status(500).json({ message: "Error updating order status" });
  }
};

// =================== PROFILE ===================
export const getAgentProfile = async (req, res) => {
  try {
    const agent = await Agent.findById(req.user._id).select("-password");
    res.json(agent);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching profile", error: error.message });
  }
};

export const updateAgentProfile = async (req, res) => {
  try {
    const agent = await Agent.findById(req.user._id);
    if (!agent) return res.status(404).json({ message: "Agent not found" });

    const { fullName, phone, region, password } = req.body;
    if (fullName) agent.fullName = fullName;
    if (phone) agent.phone = phone;
    if (region) agent.region = region;
    if (password) agent.password = await bcrypt.hash(password, 10);

    await agent.save();
    res.json({ message: "Profile updated", agent });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating profile", error: error.message });
  }
};

// =================== PAYMENTS ===================
export const getAgentPayments = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("buyer", "fullName email")
      .populate({
        path: "product",
        select: "name price farmer",
        populate: { path: "farmer", select: "fullName email" },
      });

    // map the order data into a payment-style response
    const payments = orders.map((order) => ({
      _id: order._id,
      transactionId: order.payment?.transactionId || "—",
      paymentDate: order.payment?.paymentDate || order.createdAt,
      paymentAmount: order.payment?.amount || order.total,
      orderId: order._id,
      buyer: order.buyer
        ? {
            fullName: order.buyer.fullName,
            email: order.buyer.email,
          }
        : null,
      paymentStatus: order.payment?.status || "Unpaid",
      paymentMethod: order.payment?.method || "Other",
      notes: order.payment?.notes || "",
    }));

    res.json(payments);
  } catch (error) {
    console.error("getAgentPayments:", error);
    res.status(500).json({
      message: "Error fetching payments",
      error: error.message,
    });
  }
};
