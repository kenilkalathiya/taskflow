import express from 'express';
import { createCard } from '../controllers/card.controller.js';

const router = express.Router({ mergeParams: true });

router.route('/').post(createCard);

export default router;