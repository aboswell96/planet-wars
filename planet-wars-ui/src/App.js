import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const socket = io('http://localhost:3000'); // Connect to the backend server

const Game = () => {
  const [gameState, setGameState] = useState({});
  const [messages, setMessages] = useState([]);
  const [gameId, setGameId] = useState('gameRoom1'); // Example game room ID
  const [username, setUsername] = useState(uuidv4())
  const [players, setPlayers] = useState([])

  useEffect(() => {
    // Listen for game updates from the server (e.g., player actions, new player joins)
    socket.on('gameUpdate', (message) => {
      setMessages([...messages, message]); // Show update
    });

    // Listen for game state from the server when joining the game
    socket.on('gameState', (state) => {
      setGameState(state); // Update the game state
    });

    socket.on('newPlayer', (player) => {
      setPlayers([...players, player]); // Update the game state
    });

    // Join the game room when the component mounts
    socket.emit('joinGame', {gameId, username});

    console.log("alex, ",gameId)

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
      <input value={username} onChange={(e)=>setUsername(e.target.value)}></input>
      <h2>Space Exploration Game</h2>
      <p>players</p>
      {players.map((m,i) => {
        return <div>{m}</div>
      })}
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
