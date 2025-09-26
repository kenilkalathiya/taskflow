import express from 'express';
import { createList } from '../controllers/list.controller.js';
import cardRoutes from './card.routes.js';
// We don't need 'protect' here because we'll apply it at the top level

const router = express.Router({ mergeParams: true }); // Important: mergeParams allows us to access params from the parent router (like :boardId)

router.route('/').post(createList);
router.use('/:listId/cards', cardRoutes);

export default router;