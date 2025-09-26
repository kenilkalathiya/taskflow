import { Server } from 'socket.io';

let io;
const userSockets = {}; // In-memory map of { userId: socketId }

const initializeSocket = (server) => {
  io = new Server(server, { 
    cors: { 
      origin: "http://localhost:5173", 
      methods: ["GET", "POST"] 
    } 
  });

  io.on('connection', (socket) => {
    // When a logged-in user connects, they will send their ID
    socket.on('authenticate', (userId) => {
      userSockets[userId] = socket.id;
      console.log(`User ${userId} authenticated with socket ${socket.id}`);
    });

    socket.on('joinBoard', (boardId) => {
      socket.join(boardId);
      console.log(`Socket ${socket.id} joined board room: ${boardId}`);
    });


    socket.on('cardMoved', (data) => {
      // Broadcast the change to all other clients in the room
      socket.to(data.boardId).emit('cardMoved', data.boardData);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
      // Clean up the userSockets map on disconnect
      for (const userId in userSockets) {
        if (userSockets[userId] === socket.id) {
          delete userSockets[userId];
          console.log(`User ${userId} removed from userSockets`);
          break;
        }
      }
    });
  });
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};

// We need to export userSockets to use it in our controller
const getUserSockets = () => userSockets;

export { initializeSocket, getIO, getUserSockets };