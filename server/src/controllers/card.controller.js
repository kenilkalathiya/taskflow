import asyncHandler from 'express-async-handler';
import Card from '../models/Card.model.js';
import List from '../models/List.model.js';

// @desc    Create a new card
// @route   POST /api/lists/:listId/cards
// @access  Private
const createCard = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const { listId } = req.params;

  // Find the list to ensure it exists
  const list = await List.findById(listId);
  if (!list) {
    res.status(404);
    throw new Error('List not found');
  }

  const card = await Card.create({
    title,
    list: listId,
    board: list.board, // Get the boardId from the parent list
  });

  res.status(201).json(card);
});

export { createCard };