import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000'); // Connect to the backend server

const Game = () => {
  const [gameState, setGameState] = useState({});
  const [message, setMessage] = useState('');
  const [gameId, setGameId] = useState('gameRoom1'); // Example game room ID

  useEffect(() => {
    // Listen for game updates from the server (e.g., player actions, new player joins)
    socket.on('gameUpdate', (message) => {
      setMessage(message); // Show update
    });

    // Listen for game state from the server when joining the game
    socket.on('gameState', (state) => {
      setGameState(state); // Update the game state
    });

    // Join the game room when the component mounts
    socket.emit('joinGame', gameId);

    console.log("aklex, ",gameId)

    // Clean up when component unmounts
    return () => {
      socket.off('gameUpdate');
      socket.off('gameState');
    };
  }, [gameId]);

  const playCard = (cardData) => {
    // Send card play action to the server
    socket.emit('playCard', gameId, cardData);
  };

  return (
    <div>
      <h2>Space Exploration Game</h2>
      <p>{message}</p>
      <p>Game State: {JSON.stringify(gameState)}</p>
      
      {/* Simulate playing a card */}
      <button onClick={() => playCard({ cardName: 'Battle Cruiser' })}>Play Battle Cruiser</button>
    </div>
  );
};


function App() {
  return (
    <Game/>
  );
}

export default App;
