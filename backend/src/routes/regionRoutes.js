import express from 'express';
import Region from '../models/Region.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Query regions (autocomplete)
router.get('/', async (req, res) => {
  const q = (req.query.q || '').trim();
  try {
    if (!q) {
      const regions = await Region.find().limit(20).lean();
      return res.json({ regions });
    }
    const regex = new RegExp(q, 'i');
    const regions = await Region.find({ name: regex }).limit(20).lean();
    res.json({ regions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: create region
router.post('/', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const { name, slug, meta } = req.body;
    const r = await Region.create({ name, slug, meta });
    res.status(201).json(r);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
