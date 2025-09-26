import express from 'express';
import { createBoard, getBoardsForUser, getBoardById, addMemberToBoard, updateCardOrder } from '../controllers/board.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
// import listRoutes from './list.routes.js';

const router = express.Router();

// All routes here will be protected
router.use(protect);

router.route('/')
  .post(createBoard)
  .get(getBoardsForUser);

router.route('/:id').get(getBoardById);
router.route('/:boardId/members').post(addMemberToBoard);
router.route('/:boardId/cards/reorder').put(updateCardOrder);
// router.use('/:boardId/lists', listRoutes);

export default router;