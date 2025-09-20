// backend/routes/productRoutes.js
import express from "express";
import { getProducts, getProductById } from "../controllers/productController.js";

const router = express.Router();

// Public route for buyers (fetch all products)
router.get("/", getProducts);

// Public route for single product
router.get("/:id", getProductById);

export default router;
