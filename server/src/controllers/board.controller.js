import asyncHandler from 'express-async-handler';
import Board from '../models/Board.model.js';
import User from '../models/User.model.js';
import List from '../models/List.model.js'; // Make sure these are imported
import Card from '../models/Card.model.js'; // Make sure these are imported
import { getIO, getUserSockets } from '../socketManager.js'; // ✅ Import getUserSockets again

export const createBoard = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Please provide a board name');
  }
  const board = await Board.create({
    name,
    owner: req.user._id,
    members: [req.user._id],
  });
  res.status(201).json(board);
});

export const getBoardsForUser = asyncHandler(async (req, res) => {
  const boards = await Board.find({ members: req.user._id }).sort({ createdAt: -1 });
  res.json(boards);
});

export const getBoardById = asyncHandler(async (req, res) => {
  const boardId = req.params.id;
  const board = await Board.findById(boardId);
  if (!board || !board.members.includes(req.user._id)) {
    res.status(404);
    throw new Error('Board not found or user not authorized');
  }
  const lists = await List.find({ board: boardId });
  const cards = await Card.find({ board: boardId });
  const populatedBoard = {
    ...board.toObject(),
    lists: lists.map(list => ({
      ...list.toObject(),
      cards: cards.filter(card => card.list.toString() === list._id.toString()),
    })),
  };
  res.json(populatedBoard);
});

export const addMemberToBoard = asyncHandler(async (req, res) => {
  const io = getIO();
  const userSockets = getUserSockets(); // ✅ Get the map of user sockets
  
  const { email } = req.body;
  const { boardId } = req.params;

  const userToAdd = await User.findOne({ email });
  if (!userToAdd) {
    res.status(404);
    throw new Error('User with that email not found');
  }

  const board = await Board.findById(boardId);
  if (!board) {
    res.status(404);
    throw new Error('Board not found');
  }

  if (board.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the board owner can add members');
  }

  if (board.members.includes(userToAdd._id)) {
    res.status(400);
    throw new Error('User is already a member of this board');
  }

  board.members.push(userToAdd._id);
  await board.save();

  // --- REAL-TIME NOTIFICATION TO INVITED USER ---
  const newMemberSocketId = userSockets[userToAdd._id.toString()];
  if (newMemberSocketId) {
    io.to(newMemberSocketId).emit('addedToBoard', board.toObject()); // Send the board object
  }
  // --- END REAL-TIME NOTIFICATION ---

  res.status(200).json(board);
});