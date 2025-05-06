import React from 'react';
import { SkullIcon } from 'lucide-react';

interface GameOverScreenProps {
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ onRestart }) => {
  return (
    <div className="w-full h-[600px] flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-red-900 p-8 text-center">
      <div className="animate-pulse mb-8">
        <div className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/50">
          <SkullIcon className="w-12 h-12 text-white" />
        </div>
      </div>
      
      <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">
        GAME OVER
      </h1>
      
      <p className="text-gray-300 mb-8 max-w-lg">
        Even time manipulation couldn't save you this time. The timeline has collapsed, but you can always try again!
      </p>
      
      <button 
        onClick={onRestart}
        className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/30"
      >
        TRY AGAIN
      </button>
    </div>
  );
};

export default GameOverScreen;