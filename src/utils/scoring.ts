export interface ScoreDetails {
  baseScore: number;
  efficiencyPoints: number;
  creativityPoints: number;
  jumpBonus: number;
  streakBonus: number;
  stepPenalty: number;
  guessPenalty: number;
  totalScore: number;
}

const SCORING_CONFIG = {
  BASE_SCORE: 50,
  STEP_PENALTY: 5,
  CREATIVITY_MAX: 15,
  JUMP_BONUS: 10,
  GUESS_PENALTIES: {
    FIRST: 5,
    SUBSEQUENT: 2,
  },
  STREAK_BONUSES: {
    TWO_DAY: 0.05, // 5%
    FIVE_DAY: 0.10, // 10%
  },
  MIN_SCORE: 0,
} as const;

export function calculateScore(params: {
  chainLength: number;
  minSteps: number;
  attempts: number;
  incorrectGuesses: number;
  isDirectJump: boolean;
  creativityScore: number;
  streak: number;
}): ScoreDetails {
  const {
    chainLength,
    minSteps,
    attempts,
    incorrectGuesses,
    isDirectJump,
    creativityScore,
    streak,
  } = params;

  // Calculate efficiency points
  const extraSteps = Math.max(0, chainLength - minSteps);
  const efficiencyPoints = SCORING_CONFIG.BASE_SCORE - (extraSteps * SCORING_CONFIG.STEP_PENALTY);

  // Calculate creativity points (0-15 based on word rarity and connections)
  const creativityPoints = Math.min(SCORING_CONFIG.CREATIVITY_MAX, creativityScore);

  // Calculate jump bonus
  const jumpBonus = isDirectJump ? SCORING_CONFIG.JUMP_BONUS : 0;

  // Calculate guess penalties
  const guessPenalty = incorrectGuesses > 0
    ? SCORING_CONFIG.GUESS_PENALTIES.FIRST + 
      (incorrectGuesses - 1) * SCORING_CONFIG.GUESS_PENALTIES.SUBSEQUENT
    : 0;

  // Calculate streak bonus
  let streakMultiplier = 0;
  if (streak >= 5) {
    streakMultiplier = SCORING_CONFIG.STREAK_BONUSES.FIVE_DAY;
  } else if (streak >= 2) {
    streakMultiplier = SCORING_CONFIG.STREAK_BONUSES.TWO_DAY;
  }

  // Calculate base total before streak bonus
  const baseTotal = efficiencyPoints + creativityPoints + jumpBonus - guessPenalty;
  
  // Apply streak bonus
  const streakBonus = Math.floor(baseTotal * streakMultiplier);

  // Calculate final total
  const totalScore = Math.max(SCORING_CONFIG.MIN_SCORE, baseTotal + streakBonus);

  return {
    baseScore: SCORING_CONFIG.BASE_SCORE,
    efficiencyPoints,
    creativityPoints,
    jumpBonus,
    streakBonus,
    stepPenalty: extraSteps * SCORING_CONFIG.STEP_PENALTY,
    guessPenalty,
    totalScore,
  };
} 