import express from 'express';
import { createTransaction, listTransactions } from '../controllers/transactionController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createTransaction);
router.get('/', protect, authorizeRoles('admin'), listTransactions);

export default router;
