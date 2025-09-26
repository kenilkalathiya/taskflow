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
  const { id: boardId } = req.params;

  // 1. Find the board and check user membership
  const board = await Board.findById(boardId);
  if (!board || !board.members.includes(req.user._id)) {
    res.status(404);
    throw new Error('Board not found or user not authorized');
  }

  // 2. Find all lists and all cards belonging to the board
  const lists = await List.find({ board: boardId });
  const cards = await Card.find({ board: boardId });

  // 3. Create a map of cards for efficient lookup
  const cardsMap = new Map(cards.map(card => [card._id.toString(), , card.toObject()]));

  // 4. Structure the final data
  const populatedLists = lists.map(list => {
    // ✅ THIS IS THE FIX:
    // Check if list.cardOrder exists and is an array before mapping over it.
    // If it doesn't exist, default to an empty array.
    const orderedCards = (list.cardOrder || [])
      .map(cardId => cardsMap.get(cardId.toString()))
      .filter(Boolean); // Filter out any potential nulls

    return {
      ...list.toObject(),
      cards: orderedCards,
    };
  });

  const response = {
    ...board.toObject(),
    lists: populatedLists,
  };

  res.json(response);
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

export const updateCardOrder = asyncHandler(async (req, res) => {
  const { boardId } = req.params;
  const { sourceListId, destListId, sourceOrder, destOrder } = req.body;

  // Verify the user is a member of the board
  const board = await Board.findById(boardId);
  if (!board || !board.members.includes(req.user._id)) {
    res.status(404);
    throw new Error('Board not found or user not authorized');
  }

  // If the card was moved within the same list
  if (sourceListId === destListId) {
    await List.findByIdAndUpdate(sourceListId, { cardOrder: sourceOrder });
  } else {
    // If the card was moved to a different list
    await List.findByIdAndUpdate(sourceListId, { cardOrder: sourceOrder });
    await List.findByIdAndUpdate(destListId, { cardOrder: destOrder });
  }

  res.status(200).json({ message: 'Card order updated successfully' });
});