import asyncHandler from 'express-async-handler';
import Card from '../models/Card.model.js';
import List from '../models/List.model.js';
import { getIO } from '../socketManager.js';

export const createCard = asyncHandler(async (req, res) => {
  const { listId } = req.params;
  const { title } = req.body;

  if (!title) {
    res.status(400);
    throw new Error('Please provide a card title');
  }

  const list = await List.findById(listId);
  if (!list) {
    res.status(404);
    throw new Error('List not found');
  }

  const card = await Card.create({
    title,
    list: list._id,
    board: list.board,
  });

  // ✅ ADD THIS LOGIC
  // Add the new card's ID to the end of the list's cardOrder
  list.cardOrder.push(card._id);
  await list.save();

  getIO().to(list.board.toString()).emit('cardCreated', card.toObject());

  res.status(201).json(card);
});