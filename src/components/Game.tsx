import React, { useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import GameCanvas from './GameCanvas';
import GameUI from './GameUI';
import GameControls from './GameControls';
import StartScreen from './StartScreen';
import GameOverScreen from './GameOverScreen';
import LevelCompleteScreen from './LevelCompleteScreen';

const Game: React.FC = () => {
  const { 
    gameState, 
    isGameOver, 
    isLevelComplete,
    isGameStarted,
    startGame,
    restartGame,
    nextLevel
  } = useGame();
  
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Setup game container focus handling
    const gameContainer = gameContainerRef.current;
    if (gameContainer) {
      gameContainer.focus();
    }
  }, []);

  return (
    <div 
      ref={gameContainerRef}
      className="w-full max-w-4xl relative flex flex-col items-center bg-gray-800 rounded-lg overflow-hidden shadow-2xl border border-gray-700"
      tabIndex={0}
    >
      {!isGameStarted ? (
        <StartScreen onStart={startGame} />
      ) : isGameOver ? (
        <GameOverScreen onRestart={restartGame} />
      ) : isLevelComplete ? (
        <LevelCompleteScreen onNextLevel={nextLevel} level={gameState.level} />
      ) : (
        <>
          <GameCanvas />
          <GameUI />
          <GameControls />
        </>
      )}
    </div>
  );
};

export default Game;