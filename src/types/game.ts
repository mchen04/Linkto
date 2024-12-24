import { ScoreDetails } from '../utils/scoring';

export interface GameState {
  currentChain: string[];
  isComplete: boolean;
  score: ScoreDetails | null;
  attempts: number;
  incorrectGuesses: string[];
  startTime: number;
  endTime: number | null;
}

export interface GameAction {
  type: 'ADD_WORD' | 'COMPLETE_CHAIN' | 'RESET_GAME' | 'INVALID_GUESS';
  payload?: any;
}

export interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} 