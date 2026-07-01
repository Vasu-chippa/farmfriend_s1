import express from 'express';
import { raiseTicket, getTicketsForUser, resolveTicket } from '../controllers/supportController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, raiseTicket);
router.get('/', protect, getTicketsForUser);
router.put('/:id/resolve', protect, resolveTicket);

export default router;
