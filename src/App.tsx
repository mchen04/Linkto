import { DailyChallenge } from './components/DailyChallenge';
import { GameProvider } from './context/GameContext';

export function App() {
  return (
    <GameProvider>
      <DailyChallenge />
    </GameProvider>
  );
}