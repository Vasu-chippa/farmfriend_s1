// backend/src/routes/authRoutes.js
import express from "express";
import { body } from 'express-validator';
import { registerUser, loginUser, getCurrentUser, logoutUser } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { handleValidation } from "../middlewares/validationMiddleware.js";
import { authRateLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// Register validation
router.post(
	"/register",
	authRateLimiter,
	[
		body('fullName').trim().isLength({ min: 3 }).withMessage('Full name required'),
		body('email').trim().isEmail().normalizeEmail().withMessage('Valid email required'),
		body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
		body('role').optional().isIn(['farmer', 'buyer']).withMessage('Public registration is available for farmers and buyers only'),
	],
	handleValidation,
	registerUser
);

router.post(
	"/login",
	authRateLimiter,
	[
		body('email').trim().isEmail().normalizeEmail(),
		body('password').isLength({ min: 1 }),
		body('role').optional().isIn(['farmer', 'buyer', 'agent', 'admin']),
	],
	handleValidation,
	loginUser
);

router.get("/me", protect, getCurrentUser);
router.post("/logout", logoutUser);

export default router;
