import React, { useState } from 'react';
import { ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { validateWordConnection } from '../utils/wordValidation';
import { calculateScore } from '../utils/scoring';
import { WordRelationship } from './WordRelationship';

interface ChainBuilderProps {
  startWord: string;
  endWord: string;
  minSteps: number;
  streak?: number;
}

export function ChainBuilder({ 
  startWord, 
  endWord, 
  minSteps,
  streak = 0 
}: ChainBuilderProps) {
  const { state, dispatch } = useGame();
  const [currentWord, setCurrentWord] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [relationships, setRelationships] = useState<Record<string, string | undefined>>({});
  const [creativityScores, setCreativityScores] = useState<Record<string, number>>({});
  const [isDirectJump, setIsDirectJump] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedWord = currentWord.trim().toLowerCase();
    
    if (!trimmedWord) return;

    setIsValidating(true);
    setError(null);

    const previousWord = state.currentChain.length > 0 
      ? state.currentChain[state.currentChain.length - 1] 
      : startWord;

    // Check if this is a potential final word
    const isAttemptedFinalWord = trimmedWord === endWord;

    try {
      const validation = await validateWordConnection(
        previousWord, 
        trimmedWord,
        state.currentChain
      );

      if (validation.isValid) {
        dispatch({ type: 'ADD_WORD', payload: trimmedWord });
        
        if (validation.relationship) {
          setRelationships(prev => ({
            ...prev,
            [`${previousWord}-${trimmedWord}`]: validation.relationship,
          }));
        }

        if (validation.creativity) {
          const newScore = validation.creativity;
          setCreativityScores(prev => {
            const updated = { ...prev };
            updated[`${previousWord}-${trimmedWord}`] = newScore;
            return updated;
          });
        }

        if (validation.isDirectJump) {
          setIsDirectJump(true);
        }

        setCurrentWord('');
        setError(null);
      } else {
        setError(validation.reason || 'Invalid word connection');
        if (isAttemptedFinalWord) {
          dispatch({ type: 'INVALID_GUESS', payload: trimmedWord });
        }
      }
    } catch (err) {
      setError('Error validating word connection');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmitChain = async () => {
    if (state.currentChain[state.currentChain.length - 1] === endWord) {
      // Calculate total creativity score
      const totalCreativityScore = Object.values(creativityScores)
        .reduce((sum, score) => sum + score, 0);

      const scoreDetails = calculateScore({
        chainLength: state.currentChain.length + 1, // +1 for startWord
        minSteps,
        attempts: state.attempts,
        incorrectGuesses: state.incorrectGuesses.length,
        isDirectJump,
        creativityScore: totalCreativityScore,
        streak,
      });

      dispatch({ 
        type: 'COMPLETE_CHAIN', 
        payload: { score: scoreDetails } 
      });
    }
  };

  const chainWords = [startWord, ...state.currentChain];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-center gap-4 py-6">
        {chainWords.map((word, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              <div className={`px-4 py-2 rounded ${
                index === 0 || word === endWord
                  ? 'bg-orange-100 border-2 border-orange-800 text-orange-900'
                  : 'bg-amber-50 border-2 border-brown-800 text-brown-900'
              }`}>
                {word}
              </div>
              {index > 0 && (
                <WordRelationship
                  previousWord={chainWords[index - 1]}
                  currentWord={word}
                  relationship={relationships[`${chainWords[index - 1]}-${word}`]}
                />
              )}
            </div>
            {index < chainWords.length - 1 && (
              <ArrowRight className="text-brown-600 ml-4" />
            )}
          </React.Fragment>
        ))}
      </div>

      {error && (
        <div className="text-red-600 text-center text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleAddWord} className="flex items-center space-x-2">
        <input
          type="text"
          value={currentWord}
          onChange={(e) => setCurrentWord(e.target.value)}
          className="flex-1 px-4 py-2 rounded bg-amber-50 border-2 border-brown-800 text-brown-900 focus:ring-2 focus:ring-orange-500 focus:border-brown-800"
          placeholder="Enter next word..."
          disabled={state.isComplete}
          aria-label="Enter next word"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-orange-100 text-orange-900 border-2 border-orange-800 rounded hover:bg-orange-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          disabled={state.isComplete || !currentWord.trim() || isValidating}
        >
          {isValidating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Add Word'
          )}
        </button>
      </form>

      <button
        onClick={handleSubmitChain}
        disabled={state.currentChain[state.currentChain.length - 1] !== endWord || state.isComplete}
        className="w-full px-4 py-3 bg-emerald-100 text-emerald-900 border-2 border-emerald-800 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-200 transition-colors flex items-center justify-center space-x-2"
      >
        <Sparkles className="w-5 h-5" />
        <span>Complete Chain</span>
      </button>

      {state.isComplete && state.score && (
        <div className="mt-6 p-4 bg-emerald-50 border-2 border-emerald-800 rounded-lg">
          <h3 className="text-emerald-900 font-semibold text-lg mb-2 text-center">
            Chain Complete! 🎉
          </h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-brown-700">Base Score:</span>
              <span className="text-brown-900 font-medium">{state.score.baseScore}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brown-700">Efficiency Points:</span>
              <span className="text-emerald-600 font-medium">+{state.score.efficiencyPoints}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brown-700">Creativity Bonus:</span>
              <span className="text-emerald-600 font-medium">+{state.score.creativityPoints}</span>
            </div>
            {state.score.jumpBonus > 0 && (
              <div className="flex justify-between">
                <span className="text-brown-700">Jump Bonus:</span>
                <span className="text-emerald-600 font-medium">+{state.score.jumpBonus}</span>
              </div>
            )}
            {state.score.stepPenalty > 0 && (
              <div className="flex justify-between">
                <span className="text-brown-700">Step Penalty:</span>
                <span className="text-red-600 font-medium">-{state.score.stepPenalty}</span>
              </div>
            )}
            {state.score.guessPenalty > 0 && (
              <div className="flex justify-between">
                <span className="text-brown-700">Guess Penalty:</span>
                <span className="text-red-600 font-medium">-{state.score.guessPenalty}</span>
              </div>
            )}
            {state.score.streakBonus > 0 && (
              <div className="flex justify-between">
                <span className="text-brown-700">Streak Bonus:</span>
                <span className="text-emerald-600 font-medium">+{state.score.streakBonus}</span>
              </div>
            )}
            <div className="border-t border-emerald-200 mt-2 pt-2 flex justify-between font-semibold">
              <span className="text-brown-800">Total Score:</span>
              <span className="text-emerald-700">{state.score.totalScore}</span>
            </div>
          </div>
          <p className="text-brown-600 text-xs text-center mt-3">
            Completed in {state.attempts} attempts
          </p>
        </div>
      )}
    </div>
  );
}