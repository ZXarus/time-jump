import React from 'react';
import { useGame } from '../context/GameContext';
import EnergyMeter from './EnergyMeter';
import { Timer, TimerReset } from 'lucide-react';

const GameUI: React.FC = () => {
  const { gameState, canRewindTime, isRewinding } = useGame();
  
  return (
    <div className="absolute top-0 left-0 w-full p-4 pointer-events-none">
      <div className="flex justify-between items-start">
        {/* Left side - Energy and Time Controls */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-gray-800 bg-opacity-70 p-2 rounded-lg">
            <div className={`p-1 rounded-full ${canRewindTime ? 'bg-cyan-500' : 'bg-gray-600'}`}>
              {isRewinding ? (
                <TimerReset className="w-6 h-6 text-white animate-pulse" />
              ) : (
                <Timer className="w-6 h-6 text-white" />
              )}
            </div>
            <EnergyMeter energy={gameState.rewindEnergy} maxEnergy={gameState.maxRewindEnergy} />
          </div>
        </div>
        
        {/* Right side - Level info */}
        <div className="flex flex-col items-end">
          <div className="bg-gray-800 bg-opacity-70 px-3 py-1 rounded-lg">
            <p className="text-white font-bold">Level {gameState.level}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameUI;