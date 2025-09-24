import express from 'express';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import userRoutes from './src/routes/user.routes.js'; // Import user routes
import boardRoutes from './src/routes/board.routes.js';
import listRoutes from './src/routes/list.routes.js'; // 1. Import list routes
import cardRoutes from './src/routes/card.routes.js'; // 1. Import card routes
import { notFound, errorHandler } from './src/middlewares/error.middleware.js'; // Import error handlers

// --- Initial Configuration ---
dotenv.config();
connectDB();
const app = express();

// --- Middlewares ---
app.use(express.json()); // Allows server to accept JSON in request body

// --- Routes ---
app.get('/', (req, res) => {
  res.send('TaskFlow API is running...');
});

app.use('/api/users', userRoutes); // Use user routes here
app.use('/api/boards', boardRoutes);// 2. Use board routes here
app.use('/api/boards/:boardId/lists', listRoutes);
app.use('/api/lists/:listId/cards', cardRoutes);

// --- Custom Error Handling Middlewares ---
// These should be at the very end of your middleware stack
app.use(notFound);
app.use(errorHandler);

// --- Server Startup ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});