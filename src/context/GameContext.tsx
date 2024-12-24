import React, { createContext, useContext, useReducer } from 'react';
import { GameState, GameAction, GameContextType } from '../types/game';

const initialState: GameState = {
  currentChain: [],
  isComplete: false,
  score: null,
  attempts: 0,
  incorrectGuesses: [],
  startTime: Date.now(),
  endTime: null,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ADD_WORD':
      return {
        ...state,
        currentChain: [...state.currentChain, action.payload],
        attempts: state.attempts + 1,
      };
    case 'COMPLETE_CHAIN':
      return {
        ...state,
        isComplete: true,
        score: action.payload.score,
        endTime: Date.now(),
      };
    case 'INVALID_GUESS':
      return {
        ...state,
        incorrectGuesses: [...state.incorrectGuesses, action.payload],
        attempts: state.attempts + 1,
      };
    case 'RESET_GAME':
      return {
        ...initialState,
        startTime: Date.now(),
      };
    default:
      return state;
  }
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
} 