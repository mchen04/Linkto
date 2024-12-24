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

interface ScoreParams {
  chainLength: number;
  minSteps: number;
  attempts: number;
  incorrectGuesses: number;
  isDirectJump: boolean;
  creativityScore: number;
  streak: number;
}

export const calculateScore = ({
  chainLength,
  minSteps,
  attempts,
  incorrectGuesses,
  isDirectJump,
  creativityScore,
  streak,
}: ScoreParams): ScoreDetails => {
  const baseScore = 1000;
  
  // Calculate efficiency points
  const efficiencyPoints = Math.max(0, (minSteps / chainLength) * 500);
  
  // Calculate creativity points
  const creativityPoints = creativityScore * 50;
  
  // Calculate jump bonus
  const jumpBonus = isDirectJump ? 200 : 0;
  
  // Calculate step penalty
  const extraSteps = Math.max(0, chainLength - minSteps);
  const stepPenalty = extraSteps * 50;
  
  // Calculate guess penalty
  const guessPenalty = incorrectGuesses * 25;
  
  // Calculate streak bonus
  const streakBonus = streak * 100;
  
  // Add attempts to scoring logic
  const attemptPenalty = Math.max(0, (attempts - 1) * 25);
  
  // Calculate total score
  const totalScore = baseScore + 
    efficiencyPoints + 
    creativityPoints + 
    jumpBonus - 
    stepPenalty - 
    guessPenalty - 
    attemptPenalty + 
    streakBonus;

  return {
    baseScore,
    efficiencyPoints,
    creativityPoints,
    jumpBonus,
    stepPenalty,
    guessPenalty,
    streakBonus,
    totalScore: Math.max(0, Math.round(totalScore))
  };
}; 