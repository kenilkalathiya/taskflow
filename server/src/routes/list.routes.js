import express from 'express';
import { createList } from '../controllers/list.controller.js';
// We don't need 'protect' here because we'll apply it at the top level

const router = express.Router({ mergeParams: true }); // Important: mergeParams allows us to access params from the parent router (like :boardId)

router.route('/').post(createList);

export default router;