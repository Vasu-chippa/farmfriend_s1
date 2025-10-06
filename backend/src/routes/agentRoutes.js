// apps/backend/src/routes/agentRoutes.js
import express from "express";
import {
  registerAgent,
  loginAgent,
  getAgentProfile,
  updateAgentProfile,
  getAgentFarmers,
  addFarmerByAgent,
  verifyFarmer,
  listProductsForAgent,
  approveProduct,
  getOrdersForAgent,
  approveOrder,
  updateOrderStatus,
  getAgentDashboard,
} from "../controllers/agentController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Auth
router.post("/register", registerAgent);
router.post("/login", loginAgent);

// Dashboard
router.get("/dashboard", protect, authorizeRoles("agent"), getAgentDashboard);

// Farmers
router.get("/farmers", protect, authorizeRoles("agent"), getAgentFarmers);
router.post("/farmers", protect, authorizeRoles("agent"), addFarmerByAgent);
router.put("/farmers/verify", protect, authorizeRoles("agent"), verifyFarmer);

// Products
router.get("/products", protect, authorizeRoles("agent"), listProductsForAgent);
router.put("/products/:productId/approve", protect, authorizeRoles("agent"), approveProduct);

// Orders
router.get("/orders", protect, authorizeRoles("agent"), getOrdersForAgent);
router.put("/orders/:id/approve", protect, authorizeRoles("agent"), approveOrder);
router.put("/orders/:id/status", protect, authorizeRoles("agent"), updateOrderStatus);

// Profile
router.get("/profile", protect, authorizeRoles("agent"), getAgentProfile);
router.put("/profile", protect, authorizeRoles("agent"), updateAgentProfile);

export default router;
