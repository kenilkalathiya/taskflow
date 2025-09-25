import asyncHandler from 'express-async-handler';
import List from '../models/List.model.js';
import Board from '../models/Board.model.js';
import { getIO } from '../socketManager.js'; // 1. Import getIO

// @desc    Create a new list
// @route   POST /api/boards/:boardId/lists
// @access  Private
const createList = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const { boardId } = req.params;

  // Check if the board exists and if the user is a member
  const board = await Board.findById(boardId);
  if (!board || !board.members.includes(req.user._id)) {
    res.status(404);
    throw new Error('Board not found or user not a member');
  }

  const list = await List.create({
    name,
    board: boardId,
  });

  getIO().to(boardId).emit('listCreated', { ...list.toObject(), cards: [] });

  res.status(201).json(list);
});

export { createList };