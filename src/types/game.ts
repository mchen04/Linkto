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

export interface ScoreDetails {
  baseScore: number;
  efficiencyPoints: number;
  creativityPoints: number;
  jumpBonus: number;
  stepPenalty: number;
  guessPenalty: number;
  streakBonus: number;
  totalScore: number;
}

export interface GameStats {
  startTime: number;
  endTime: number;
  chainLength: number;
  minSteps: number;
  creativityScores: number[];
  attempts: number;
} 