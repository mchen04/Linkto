export interface Chain {
  id: string;
  startWord: string;
  endWord: string;
  minSteps: number;
  date: string;
}

export interface ChainAttempt {
  words: string[];
  isComplete: boolean;
  score: number;
}

export interface UserStats {
  currentStreak: number;
  totalCompleted: number;
  bestScore: number;
  averageSteps: number;
}