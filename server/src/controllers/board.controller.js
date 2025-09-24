import asyncHandler from 'express-async-handler';
import Board from '../models/Board.model.js';
import List from '../models/List.model.js';
import Card from '../models/Card.model.js';

// @desc    Create a new board
// @route   POST /api/boards
// @access  Private
const createBoard = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Please provide a board name');
  }

  const board = await Board.create({
    name,
    owner: req.user._id,
    members: [req.user._id], // The creator is automatically a member
  });

  res.status(201).json(board);
});

// @desc    Get all boards for the logged-in user
// @route   GET /api/boards
// @access  Private
const getBoardsForUser = asyncHandler(async (req, res) => {
  // Find all boards where the current user's ID is in the 'members' array
  const boards = await Board.find({ members: req.user._id }).sort({ createdAt: -1 });
  res.json(boards);
});

// @desc    Get a single board by ID with all its lists and cards
// @route   GET /api/boards/:id
// @access  Private
const getBoardById = asyncHandler(async (req, res) => {
  const boardId = req.params.id;

  // First, find the board and verify the user is a member
  const board = await Board.findById(boardId);
  if (!board || !board.members.includes(req.user._id)) {
    res.status(404);
    throw new Error('Board not found or user not authorized');
  }

  // Find all lists that belong to this board
  const lists = await List.find({ board: boardId });
  // Find all cards that belong to this board
  const cards = await Card.find({ board: boardId });

  // Structure the response
  const populatedBoard = {
    ...board.toObject(),
    lists: lists.map(list => ({
      ...list.toObject(),
      cards: cards.filter(card => card.list.toString() === list._id.toString()),
    })),
  };

  res.json(populatedBoard);
});

export { createBoard, getBoardsForUser, getBoardById };