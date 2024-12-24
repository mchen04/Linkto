export interface ScoreDetails {
  baseScore: number;
  speedBonus: number;
  creativityScore: number;
  efficiencyMultiplier: number;
  chainPenalty: number;
  finalScore: number;
  breakdown: {
    timeElapsed: number;
    optimalSteps: number;
    actualSteps: number;
    averageCreativity: number;
  };
}

const SCORING_CONFIG = {
  BASE_SCORE: 1000,
  TIME: {
    PERFECT_TIME: 30, // seconds
    GOOD_TIME: 60,
    MAX_TIME: 300, // 5 minutes
    DECAY_RATE: 0.15,
  },
  CREATIVITY: {
    WEIGHT: 0.4,
    BONUS_THRESHOLD: 0.7,
    EXCEPTIONAL_THRESHOLD: 0.9,
  },
  EFFICIENCY: {
    OPTIMAL_BONUS: 1.5,
    STEP_PENALTY_RATE: 0.8, // Exponential decay for each extra step
    MAX_PENALTY: 0.2, // Minimum multiplier
  },
} as const;

export function calculateScore(params: {
  startTime: number;
  endTime: number;
  chainLength: number;
  minSteps: number;
  creativityScores: number[]; // Array of creativity scores from word relationships
}): ScoreDetails {
  const { startTime, endTime, chainLength, minSteps, creativityScores } = params;
  
  // Calculate time-based components
  const timeElapsed = (endTime - startTime) / 1000; // Convert to seconds
  const speedBonus = calculateSpeedBonus(timeElapsed);
  
  // Calculate creativity score
  const averageCreativity = creativityScores.reduce((sum, score) => sum + score, 0) / creativityScores.length;
  const creativityScore = calculateCreativityScore(averageCreativity, creativityScores);
  
  // Calculate efficiency multiplier and chain penalty
  const { efficiencyMultiplier, chainPenalty } = calculateEfficiencyFactors(chainLength, minSteps);
  
  // Calculate final score
  const baseWithSpeed = SCORING_CONFIG.BASE_SCORE * speedBonus;
  const withCreativity = baseWithSpeed + creativityScore;
  const withEfficiency = withCreativity * efficiencyMultiplier;
  const finalScore = Math.max(0, Math.round(withEfficiency - chainPenalty));

  return {
    baseScore: SCORING_CONFIG.BASE_SCORE,
    speedBonus,
    creativityScore,
    efficiencyMultiplier,
    chainPenalty,
    finalScore,
    breakdown: {
      timeElapsed,
      optimalSteps: minSteps,
      actualSteps: chainLength,
      averageCreativity,
    },
  };
}

function calculateSpeedBonus(timeElapsed: number): number {
  if (timeElapsed <= SCORING_CONFIG.TIME.PERFECT_TIME) {
    // Perfect time bonus
    return 1.5;
  } else if (timeElapsed <= SCORING_CONFIG.TIME.GOOD_TIME) {
    // Linear decay between perfect and good time
    const ratio = (SCORING_CONFIG.TIME.GOOD_TIME - timeElapsed) / 
                 (SCORING_CONFIG.TIME.GOOD_TIME - SCORING_CONFIG.TIME.PERFECT_TIME);
    return 1 + (0.5 * ratio);
  } else {
    // Exponential decay after good time
    const overtime = timeElapsed - SCORING_CONFIG.TIME.GOOD_TIME;
    const decayFactor = Math.exp(-SCORING_CONFIG.TIME.DECAY_RATE * overtime / SCORING_CONFIG.TIME.MAX_TIME);
    return Math.max(0.1, decayFactor);
  }
}

function calculateCreativityScore(averageCreativity: number, creativityScores: number[]): number {
  // Base creativity score
  let score = averageCreativity * SCORING_CONFIG.BASE_SCORE * SCORING_CONFIG.CREATIVITY.WEIGHT;
  
  // Bonus for consistent high creativity
  const highCreativityMoves = creativityScores.filter(
    score => score >= SCORING_CONFIG.CREATIVITY.BONUS_THRESHOLD
  ).length;
  
  if (highCreativityMoves >= creativityScores.length * 0.7) {
    score *= 1.2; // 20% bonus for mostly creative moves
  }
  
  // Extra bonus for exceptional moves
  const exceptionalMoves = creativityScores.filter(
    score => score >= SCORING_CONFIG.CREATIVITY.EXCEPTIONAL_THRESHOLD
  ).length;
  
  score += exceptionalMoves * 50; // Bonus points for each exceptional move
  
  // Combo bonus for consecutive creative moves
  let maxCombo = 0;
  let currentCombo = 0;
  for (const score of creativityScores) {
    if (score >= SCORING_CONFIG.CREATIVITY.BONUS_THRESHOLD) {
      currentCombo++;
      maxCombo = Math.max(maxCombo, currentCombo);
    } else {
      currentCombo = 0;
    }
  }
  
  score += maxCombo * 25; // Bonus points for longest creative combo
  
  return Math.round(score);
}

function calculateEfficiencyFactors(chainLength: number, minSteps: number): {
  efficiencyMultiplier: number;
  chainPenalty: number;
} {
  // Calculate how many extra steps were used
  const extraSteps = chainLength - minSteps;
  
  // Perfect path bonus
  if (extraSteps <= 0) {
    return {
      efficiencyMultiplier: SCORING_CONFIG.EFFICIENCY.OPTIMAL_BONUS,
      chainPenalty: 0,
    };
  }
  
  // Exponential penalty for extra steps
  const efficiencyMultiplier = Math.max(
    SCORING_CONFIG.EFFICIENCY.MAX_PENALTY,
    Math.pow(SCORING_CONFIG.EFFICIENCY.STEP_PENALTY_RATE, extraSteps)
  );
  
  // Additional penalty for very long chains
  const chainPenalty = Math.pow(extraSteps, 1.5) * 10;
  
  return {
    efficiencyMultiplier,
    chainPenalty,
  };
} 