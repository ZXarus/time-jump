import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';

const GameControls: React.FC = () => {
  const { 
    movePlayer, 
    jumpPlayer, 
    startRewindTime, 
    stopRewindTime,
    pauseGame,
    resumeGame,
    isPaused
  } = useGame();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return; // Prevent key repeat for smoother control
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
          movePlayer(-1);
          break;
        case 'ArrowRight':
        case 'd':
          movePlayer(1);
          break;
        case 'ArrowUp':
        case 'w':
        case ' ':
          jumpPlayer();
          break;
        case 'r':
        case 'Shift':
          startRewindTime();
          break;
        case 'Escape':
          if (isPaused) {
            resumeGame();
          } else {
            pauseGame();
          }
          break;
        default:
          break;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'ArrowRight':
        case 'd':
          movePlayer(0);
          break;
        case 'r':
        case 'Shift':
          stopRewindTime();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [movePlayer, jumpPlayer, startRewindTime, stopRewindTime, pauseGame, resumeGame, isPaused]);

  const buttonBaseClass = "w-16 h-16 bg-gray-800 bg-opacity-50 rounded-full flex items-center justify-center text-white border-2 transition-all duration-150 active:scale-95 active:transform";
  
  return (
    <div className="absolute bottom-4 left-0 w-full flex justify-center md:hidden">
      <div className="flex gap-4">
        {/* Left */}
        <button
          className={`${buttonBaseClass} border-gray-600 active:bg-gray-700 active:border-gray-500`}
          onTouchStart={() => movePlayer(-1)}
          onTouchEnd={() => movePlayer(0)}
          onTouchCancel={() => movePlayer(0)}
          onContextMenu={(e) => e.preventDefault()}
        >
          ←
        </button>
        
        {/* Jump */}
        <button
          className={`${buttonBaseClass} border-gray-600 active:bg-gray-700 active:border-gray-500`}
          onTouchStart={jumpPlayer}
          onContextMenu={(e) => e.preventDefault()}
        >
          ↑
        </button>
        
        {/* Right */}
        <button
          className={`${buttonBaseClass} border-gray-600 active:bg-gray-700 active:border-gray-500`}
          onTouchStart={() => movePlayer(1)}
          onTouchEnd={() => movePlayer(0)}
          onTouchCancel={() => movePlayer(0)}
          onContextMenu={(e) => e.preventDefault()}
        >
          →
        </button>
        
        {/* Rewind */}
        <button
          className={`${buttonBaseClass} border-cyan-600 active:bg-cyan-900 active:border-cyan-500`}
          onTouchStart={startRewindTime}
          onTouchEnd={stopRewindTime}
          onTouchCancel={stopRewindTime}
          onContextMenu={(e) => e.preventDefault()}
        >
          ↺
        </button>
      </div>
    </div>
  );
};

export default GameControls;