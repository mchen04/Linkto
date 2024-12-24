import React from 'react';
import { BookOpen, Flame, Calendar } from 'lucide-react';
import { ChainBuilder } from './ChainBuilder';
import { useGame } from '../context/GameContext';

const MOCK_CHALLENGE = {
  id: '2024-03-14',
  startWord: 'ocean',
  endWord: 'book',
  minSteps: 4,
  date: '2024-03-14',
};

export function DailyChallenge() {
  const { state } = useGame();

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-brown-900 font-serif">
            Linkdle
          </h1>
          <p className="text-brown-700 mt-2 font-medium">
            Connect words, expand your mind
          </p>
        </header>

        <div className="puzzle-card rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Calendar className="text-brown-700" />
              <span className="text-brown-700 font-medium">Daily Puzzle</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Flame className="text-orange-500" />
                <span className="text-brown-700">Streak: 5</span>
              </div>
              <div className="flex items-center space-x-1">
                <BookOpen className="text-emerald-600" />
                <span className="text-brown-700">Best: 75</span>
              </div>
            </div>
          </div>

          <ChainBuilder
            startWord={MOCK_CHALLENGE.startWord}
            endWord={MOCK_CHALLENGE.endWord}
          />
        </div>

        <div className="puzzle-card h-24 flex items-center justify-center text-brown-700">
          Advertisement
        </div>
      </div>
    </div>
  );
}