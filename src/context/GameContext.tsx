import React, { createContext, useContext, useState, useCallback, useEffect, useReducer } from 'react';
import { GameState, initialGameState, gameReducer } from '../game/gameState';
import { updateGame } from '../game/engine';

type GameContextType = {
  gameState: GameState;
  isGameOver: boolean;
  isLevelComplete: boolean;
  isGameStarted: boolean;
  isPaused: boolean;
  canRewindTime: boolean;
  isRewinding: boolean;
  startGame: () => void;
  restartGame: () => void;
  nextLevel: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  movePlayer: (direction: number) => void;
  jumpPlayer: () => void;
  startRewindTime: () => void;
  stopRewindTime: () => void;
  updateGameDimensions: (width: number, height: number) => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const [lastTime, setLastTime] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Derived states
  const isGameOver = gameState.player.health <= 0;
  const isLevelComplete = gameState.levelComplete;
  const canRewindTime = gameState.rewindEnergy > 0;
  const isRewinding = gameState.isRewinding;
  
  // Game loop
  useEffect(() => {
    if (!isGameStarted || isPaused || isGameOver || isLevelComplete) return;
    
    const gameLoop = (timestamp: number) => {
      if (lastTime === 0) {
        setLastTime(timestamp);
        requestAnimationFrame(gameLoop);
        return;
      }
      
      const deltaTime = (timestamp - lastTime) / 1000; // Convert to seconds
      
      // Update game state
      dispatch({
        type: 'UPDATE_GAME',
        payload: updateGame(gameState, deltaTime)
      });
      
      setLastTime(timestamp);
      requestAnimationFrame(gameLoop);
    };
    
    const animationId = requestAnimationFrame(gameLoop);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [gameState, lastTime, isGameStarted, isPaused, isGameOver, isLevelComplete]);
  
  // Player movement
  const movePlayer = useCallback((direction: number) => {
    if (isPaused || isGameOver || isLevelComplete) return;
    
    dispatch({
      type: 'MOVE_PLAYER',
      payload: { direction }
    });
  }, [isPaused, isGameOver, isLevelComplete]);
  
  // Player jump
  const jumpPlayer = useCallback(() => {
    if (isPaused || isGameOver || isLevelComplete) return;
    
    dispatch({
      type: 'JUMP_PLAYER'
    });
  }, [isPaused, isGameOver, isLevelComplete]);
  
  // Time rewind
  const startRewindTime = useCallback(() => {
    if (isPaused || isGameOver || isLevelComplete || !canRewindTime) return;
    
    dispatch({
      type: 'START_REWIND'
    });
  }, [isPaused, isGameOver, isLevelComplete, canRewindTime]);
  
  const stopRewindTime = useCallback(() => {
    if (isPaused || isGameOver || isLevelComplete) return;
    
    dispatch({
      type: 'STOP_REWIND'
    });
  }, [isPaused, isGameOver, isLevelComplete]);
  
  // Game control functions
  const startGame = useCallback(() => {
    setIsGameStarted(true);
    setLastTime(0);
  }, []);
  
  const restartGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
    setLastTime(0);
  }, []);
  
  const nextLevel = useCallback(() => {
    dispatch({ type: 'NEXT_LEVEL' });
    setLastTime(0);
  }, []);
  
  const pauseGame = useCallback(() => {
    setIsPaused(true);
  }, []);
  
  const resumeGame = useCallback(() => {
    setIsPaused(false);
    setLastTime(0);
  }, []);
  
  // Update game dimensions
  const updateGameDimensions = useCallback((width: number, height: number) => {
    dispatch({
      type: 'UPDATE_DIMENSIONS',
      payload: { width, height }
    });
  }, []);
  
  return (
    <GameContext.Provider
      value={{
        gameState,
        isGameOver,
        isLevelComplete,
        isGameStarted,
        isPaused,
        canRewindTime,
        isRewinding,
        startGame,
        restartGame,
        nextLevel,
        pauseGame,
        resumeGame,
        movePlayer,
        jumpPlayer,
        startRewindTime,
        stopRewindTime,
        updateGameDimensions
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};