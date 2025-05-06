import React from 'react';
import { Rewind as ClockRewind } from 'lucide-react';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="w-full h-[600px] flex flex-col items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900 p-8 text-center">
      <div className="animate-bounce mb-8">
        <div className="w-24 h-24 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/50">
          <ClockRewind className="w-12 h-12 text-white" />
        </div>
      </div>
      
      <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">
        <span className="text-cyan-400">Time</span> Jumper
      </h1>
      
      <p className="text-gray-300 mb-8 max-w-lg">
        Navigate through platforms, avoid hazards, and defeat enemies with your time manipulation powers.
        Rewind time to escape danger, but be careful—your energy is limited!
      </p>
      
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center gap-3 text-gray-300">
          <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">←→</kbd>
          <span>or</span>
          <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">A D</kbd>
          <span>Move</span>
        </div>
        
        <div className="flex items-center gap-3 text-gray-300">
          <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">↑</kbd>
          <span>or</span>
          <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">W</kbd>
          <span>or</span>
          <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">SPACE</kbd>
          <span>Jump</span>
        </div>
        
        <div className="flex items-center gap-3 text-gray-300">
          <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">SHIFT</kbd>
          <span>or</span>
          <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">R</kbd>
          <span>Rewind Time</span>
        </div>
      </div>
      
      <button 
        onClick={onStart}
        className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/30"
      >
        START GAME
      </button>
    </div>
  );
};

export default StartScreen;