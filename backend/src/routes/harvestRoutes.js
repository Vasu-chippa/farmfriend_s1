import express from "express";
import { body } from 'express-validator';
import {
  getHarvest,
  addCrop,
  removeCrop,
} from "../controllers/harvestController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { handleValidation } from "../middlewares/validationMiddleware.js";

const router = express.Router();

// ✅ Get all harvest crops for logged-in farmer
router.get("/", protect, getHarvest);

// Add new crop to harvest (validation)
router.post(
  "/",
  protect,
  [
    body('cropId').optional().isString(),
    body('name').notEmpty().withMessage('Crop name required'),
    body('quantity').optional().isNumeric(),
    body('price').optional().isNumeric(),
  ],
  handleValidation,
  addCrop
);

// Soft-remove crop from harvest
router.delete("/:cropId", protect, removeCrop);

// Restore an archived crop
router.post('/:cropId/restore', protect, async (req, res) => {
  // delegate to controller restoreCrop if exported
  try {
    // dynamic import to avoid circular issues
    const { restoreCrop } = await import('../controllers/harvestController.js');
    return restoreCrop(req, res);
  } catch (err) {
    return res.status(500).json({ error: 'Restore not available' });
  }
});

export default router;
