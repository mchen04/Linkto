import React from 'react';
import { DailyChallenge } from './components/DailyChallenge';
import { GameProvider } from './context/GameContext';

function App() {
  return (
    <GameProvider>
      <DailyChallenge />
    </GameProvider>
  );
}

export default App;