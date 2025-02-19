const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// Initialize Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with custom CORS options
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3001',  // Frontend URL (running on port 3001)
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  }
});

// Track game state (example)
let games = {};

// Middleware to allow CORS for HTTP requests (API or other)
app.use(cors({
  origin: 'http://localhost:3001',  // Frontend URL (running on port 3001)
  methods: ['GET', 'POST'],
  credentials: true,
}));

// Handle player connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for a player joining a game
  socket.on('joinGame', (gameId) => {
    console.log(`Player joining game: ${gameId}`);
    
    // Join the room for the game
    socket.join(gameId);

    // If the game doesn't exist, create a new one
    if (!games[gameId]) {
      games[gameId] = {
        players: [],
        gameState: {}
      };
    }

    // Add the player to the game
    games[gameId].players.push(socket.id);

    // Emit a message to the room (game)
    io.to(gameId).emit('gameUpdate', `A new player has joined the game!`);
    
    // Send current game state to the new player
    socket.emit('gameState', games[gameId].gameState);
  });

  // Handle player action (e.g., playing a card)
  socket.on('playCard', (gameId, cardData) => {
    console.log(`Card played: ${cardData.cardName} in game ${gameId}`);

    // Update the game state (example)
    if (games[gameId]) {
      // Modify the game state here
      games[gameId].gameState = { ...games[gameId].gameState, lastCardPlayed: cardData };

      // Broadcast the card played to all players in the game
      io.to(gameId).emit('gameUpdate', `${cardData.cardName} has been played!`);
    }
  });

  // Handle disconnect (remove player from the room)
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    
    // Remove player from the game (if they were in one)
    for (let gameId in games) {
      const playerIndex = games[gameId].players.indexOf(socket.id);
      if (playerIndex !== -1) {
        games[gameId].players.splice(playerIndex, 1);
        io.to(gameId).emit('gameUpdate', 'A player has left the game.');
        break;
      }
    }
  });
});

// Start the server on port 3000
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
