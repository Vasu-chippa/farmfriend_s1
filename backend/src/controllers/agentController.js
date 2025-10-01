import Agent from "../models/Agent.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Crop from "../models/Crop.js";
import bcrypt from "bcryptjs";

// =================== DASHBOARD ===================
export const getAgentDashboard = async (req, res) => {
  try {
    const agentId = req.user._id;

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
    res.status(500).json({ message: "Error fetching agent dashboard", error: error.message });
  }
};

// =================== FARMERS ===================
export const getAgentFarmers = async (req, res) => {
  try {
    const farmers = await User.find({ role: "farmer" }).select("-password");
    res.json(farmers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching farmers", error: error.message });
  }
};

export const addFarmerByAgent = async (req, res) => {
  try {
    const { fullName, email, password, phone, age, address } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Farmer already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const farmer = new User({ fullName, email, password: hashed, role: "farmer", phone, age, address });
    await farmer.save();

    res.status(201).json({ message: "Farmer added successfully", farmer });
  } catch (error) {
    res.status(500).json({ message: "Error adding farmer", error: error.message });
  }
};

// =================== PRODUCTS ===================
export const listProductsForAgent = async (req, res) => {
  try {
    const products = await Product.find().populate("farmer", "fullName email");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};

// =================== ORDERS ===================
export const getOrdersForAgent = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("buyer", "fullName email")
      .populate("product", "name price");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: "Error updating order", error: error.message });
  }
};

// =================== PROFILE ===================
export const getAgentProfile = async (req, res) => {
  try {
    const agent = await Agent.findById(req.user._id).select("-password");
    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error: error.message });
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
    if (password) {
      agent.password = await bcrypt.hash(password, 10);
    }

    await agent.save();
    res.json({ message: "Profile updated", agent });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};
