import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import {
  getAgentDashboard,
  getAgentFarmers,
  addFarmerByAgent,
  listProductsForAgent,
  getOrdersForAgent,
  updateOrderStatus,
  getAgentProfile,
  updateAgentProfile
} from "../controllers/agentController.js";
import { loginAgent } from "../controllers/agentAuthController.js";


const router = express.Router();
router.post("/login", loginAgent);
router.get("/dashboard", protect, authorizeRoles("agent"), getAgentDashboard);

router.get("/farmers", protect, authorizeRoles("agent"), getAgentFarmers);
router.post("/farmers", protect, authorizeRoles("agent"), addFarmerByAgent);

router.get("/products", protect, authorizeRoles("agent"), listProductsForAgent);

router.get("/orders", protect, authorizeRoles("agent"), getOrdersForAgent);
router.put("/orders/:id", protect, authorizeRoles("agent"), updateOrderStatus);

router.get("/profile", protect, authorizeRoles("agent"), getAgentProfile);
router.put("/profile", protect, authorizeRoles("agent"), updateAgentProfile);

export default router;
