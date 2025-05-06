import React, { useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { renderGame } from '../game/renderer';

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gameState, updateGameDimensions } = useGame();
  
  // Setup canvas and handle resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    const handleResize = () => {
      // Use parent container dimensions for responsive sizing
      const parent = canvas.parentElement;
      if (!parent) return;
      
      // Set dimensions based on container size with a maximum
      const width = Math.min(parent.clientWidth, 1024);
      const height = Math.min(width * 0.6, 600); // 16:10 aspect ratio (approximately)
      
      // Update canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Update game dimensions in context
      updateGameDimensions(width, height);
    };
    
    // Initial sizing
    handleResize();
    
    // Setup resize listener
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [updateGameDimensions]);
  
  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    let animationFrameId: number;
    
    const render = () => {
      renderGame(context, gameState);
      animationFrameId = window.requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [gameState]);
  
  return (
    <canvas 
      ref={canvasRef}
      className="bg-gray-900 w-full"
    />
  );
};

export default GameCanvas;