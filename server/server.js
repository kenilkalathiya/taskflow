import express from 'express';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import userRoutes from './src/routes/user.routes.js';
import boardRoutes from './src/routes/board.routes.js';
import listRoutes from './src/routes/list.routes.js';
import cardRoutes from './src/routes/card.routes.js';
import { notFound, errorHandler } from './src/middlewares/error.middleware.js';
import { initializeSocket } from './src/socketManager.js';
import http from 'http'; // Make sure http is imported
import cors from 'cors';

// --- Initial Configuration ---
dotenv.config();
connectDB();
const app = express();
const server = http.createServer(app); // Create the HTTP server from the Express app

// --- Initialize Socket.IO ---
// Pass the HTTP server (not the Express app) to the socket manager
initializeSocket(server);

// --- Middlewares ---
app.use(express.json());
app.use(cors());

// --- Routes ---
app.get('/', (req, res) => {
  res.send('TaskFlow API is running...');
});

app.use('/api/users', userRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/boards/:boardId/lists', listRoutes);
app.use('/api/lists/:listId/cards', cardRoutes);

// --- Custom Error Handling ---
app.use(notFound);
app.use(errorHandler);

// --- Server Startup ---
const PORT = process.env.PORT || 5000;

// ✅ THIS IS THE CRITICAL CHANGE
// You must use `server.listen` to start the server, not `app.listen`.
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});