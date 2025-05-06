import React from 'react';
import { CheckCircle } from 'lucide-react';

interface LevelCompleteScreenProps {
  onNextLevel: () => void;
  level: number;
}

const LevelCompleteScreen: React.FC<LevelCompleteScreenProps> = ({ onNextLevel, level }) => {
  return (
    <div className="w-full h-[600px] flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-green-900 p-8 text-center">
      <div className="animate-bounce mb-8">
        <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/50">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
      </div>
      
      <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">
        LEVEL {level} COMPLETE!
      </h1>
      
      <p className="text-gray-300 mb-8 max-w-lg">
        You've successfully navigated this timeline! But greater challenges await in the next level.
      </p>
      
      <button 
        onClick={onNextLevel}
        className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/30"
      >
        NEXT LEVEL
      </button>
    </div>
  );
};

export default LevelCompleteScreen;