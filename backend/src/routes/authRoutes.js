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
		body('fullName').isLength({ min: 3 }).withMessage('Full name required'),
		body('email').isEmail().withMessage('Valid email required'),
		body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
	],
	handleValidation,
	registerUser
);

router.post(
	"/login",
	authRateLimiter,
	[body('email').isEmail(), body('password').isLength({ min: 1 })],
	handleValidation,
	loginUser
);

router.get("/me", protect, getCurrentUser);
router.post("/logout", logoutUser);

export default router;
