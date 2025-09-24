import express from 'express';
import { createBoard, getBoardsForUser, getBoardById } from '../controllers/board.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes here will be protected
router.use(protect);

router.route('/')
  .post(createBoard)
  .get(getBoardsForUser);

router.route('/:id').get(getBoardById);

export default router;