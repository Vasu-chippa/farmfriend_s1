// routes/cropRoutes.js
import express from "express";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";
import { getCrops, getCropById, createCrop, updateCrop, deleteCrop } from "../controllers/cropController.js";

const router = express.Router();

// ---------------- Farmer Protected Routes ----------------
// Farmer can see/manage their own crops
router.get("/", protect, authorizeRoles("farmer"), getCrops);
router.get("/:id", protect, authorizeRoles("farmer"), getCropById);
router.post("/", protect, authorizeRoles("farmer"), createCrop);
router.put("/:id", protect, authorizeRoles("farmer"), updateCrop);
router.delete("/:id", protect, authorizeRoles("farmer"), deleteCrop);

// ---------------- Public/Buyer Routes ----------------
// Buyers can view all farmer-uploaded crops
router.get("/public/all", getCrops);
router.get("/public/:id", getCropById);

export default router;
