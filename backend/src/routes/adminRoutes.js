// backend/src/routes/adminRoutes.js
import express from "express";
import {
  getFarmers,
  addFarmer,
  updateFarmer,
  deleteFarmer,
  getDashboardData,
  getAllUsers,
  getAllAgents,
  getAllOrders,
  updateOrderStatus,
  getAllPayments,
  getAllProducts,
  approveProduct,
} from "../controllers/adminController.js";

import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 🔹 Dashboard summary
router.get("/dashboard", protect, authorizeRoles("admin"), getDashboardData);

// 🔹 All Users
router.get("/users", protect, authorizeRoles("admin"), getAllUsers);

// 🔹 Manage farmers
router.get("/farmers", protect, authorizeRoles("admin"), getFarmers);
router.post("/farmers", protect, authorizeRoles("admin"), addFarmer);
router.put("/farmers/:id", protect, authorizeRoles("admin"), updateFarmer);
router.delete("/farmers/:id", protect, authorizeRoles("admin"), deleteFarmer);

// 🔹 View agents
router.get("/agents", protect, authorizeRoles("admin"), getAllAgents);

// 🔹 Orders management
router.get("/orders", protect, authorizeRoles("admin"), getAllOrders);
router.put("/orders/:id/status", protect, authorizeRoles("admin"), updateOrderStatus);

// 🔹 Payments (from orders)
router.get("/payments", protect, authorizeRoles("admin"), getAllPayments);

// 🔹 Products (crops/marketplace)
router.get("/products", protect, authorizeRoles("admin"), getAllProducts);
router.put("/products/:id/approve", protect, authorizeRoles("admin"), approveProduct);

export default router;
