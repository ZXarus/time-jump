import React, { useEffect } from 'react';
import Game from './components/Game';
import { GameProvider } from './context/GameContext';
import './index.css';

function App() {
  useEffect(() => {
    // Update the document title
    document.title = 'Time Jumper';
    
    // Update favicon (optional)
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = '/time-jumper-favicon.svg';
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <GameProvider>
        <Game />
      </GameProvider>
    </div>
  );
}

export default App;