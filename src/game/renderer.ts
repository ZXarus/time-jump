import { GameState } from './gameState';
import { drawPlayer, drawPlatform, drawEnemy, drawTimeTrail } from './entities';

// Main render function
export function renderGame(ctx: CanvasRenderingContext2D, gameState: GameState) {
  // Clear canvas
  ctx.clearRect(0, 0, gameState.width, gameState.height);
  
  // Draw background
  drawBackground(ctx, gameState);
  
  // Draw time trail if rewinding
  if (gameState.isRewinding || gameState.timeHistory.length > 0) {
    drawTimeTrail(ctx, gameState.timeHistory, gameState.player.size);
  }
  
  // Draw platforms
  gameState.platforms.forEach(platform => {
    drawPlatform(ctx, platform);
  });
  
  // Draw enemies
  gameState.enemies.forEach(enemy => {
    drawEnemy(ctx, enemy);
  });
  
  // Draw player
  drawPlayer(ctx, gameState.player);
  
  // Draw rewind effect if active
  if (gameState.isRewinding) {
    drawRewindEffect(ctx, gameState);
  }
}

// Draw layered background with parallax effect
function drawBackground(ctx: CanvasRenderingContext2D, gameState: GameState) {
  const { width, height } = gameState;
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#0f172a');
  gradient.addColorStop(1, '#1e293b');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Draw stars
  ctx.fillStyle = '#ffffff';
  
  // Use deterministic star positions based on level for consistency
  const starSeed = gameState.level * 100;
  const starCount = 100 + gameState.level * 20;
  
  for (let i = 0; i < starCount; i++) {
    const x = (starSeed * (i + 1) * 1.5) % width;
    const y = (starSeed * (i + 2) * 2.7) % height;
    const size = ((i * starSeed) % 3) + 1;
    
    // Make some stars twinkle
    const alpha = 0.3 + (Math.sin(Date.now() / (1000 + i * 100)) + 1) * 0.35;
    
    ctx.globalAlpha = alpha;
    ctx.fillRect(x, y, size, size);
  }
  
  ctx.globalAlpha = 1;
  
  // Draw grid lines for a tech effect
  ctx.strokeStyle = 'rgba(49, 120, 198, 0.1)';
  ctx.lineWidth = 1;
  
  // Horizontal grid lines
  const gridSpacing = 40;
  for (let y = 0; y < height; y += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  // Vertical grid lines
  for (let x = 0; x < width; x += gridSpacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
}

// Draw time rewind visual effect
function drawRewindEffect(ctx: CanvasRenderingContext2D, gameState: GameState) {
  const { width, height } = gameState;
  
  // Draw a semi-transparent overlay
  ctx.fillStyle = 'rgba(8, 145, 178, 0.1)';
  ctx.fillRect(0, 0, width, height);
  
  // Draw clock-like effect around player
  const playerCenterX = gameState.player.position.x + gameState.player.size.width / 2;
  const playerCenterY = gameState.player.position.y + gameState.player.size.height / 2;
  const radius = 60 + Math.sin(Date.now() / 100) * 10;
  
  // Draw rotating clock hands
  const time = Date.now() / 1000;
  const handAngle = time * 10 % (Math.PI * 2); // Rotate counterclockwise
  
  // Hour hand
  ctx.strokeStyle = 'rgba(14, 165, 233, 0.8)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(playerCenterX, playerCenterY);
  ctx.lineTo(
    playerCenterX + Math.cos(handAngle) * radius * 0.5,
    playerCenterY + Math.sin(handAngle) * radius * 0.5
  );
  ctx.stroke();
  
  // Minute hand
  ctx.strokeStyle = 'rgba(14, 165, 233, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(playerCenterX, playerCenterY);
  ctx.lineTo(
    playerCenterX + Math.cos(handAngle * 12) * radius * 0.7,
    playerCenterY + Math.sin(handAngle * 12) * radius * 0.7
  );
  ctx.stroke();
  
  // Clock circle
  ctx.strokeStyle = 'rgba(8, 145, 178, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(playerCenterX, playerCenterY, radius, 0, Math.PI * 2);
  ctx.stroke();
  
  // Particle effect
  const particleCount = 10;
  ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
  
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2 + time * 2;
    const x = playerCenterX + Math.cos(angle) * (radius + 10 * Math.sin(time * 5 + i));
    const y = playerCenterY + Math.sin(angle) * (radius + 10 * Math.sin(time * 5 + i));
    const size = 2 + Math.sin(time * 3 + i) * 2;
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}