import { Vector2D } from './gameState';

export interface Entity {
  position: Vector2D;
  velocity: Vector2D;
  size: { width: number; height: number };
  color: string;
}

export interface Player extends Entity {
  speed: number;
  jumpForce: number;
  isJumping: boolean;
  isOnGround: boolean;
  direction: number;
  health: number;
  canDoubleJump: boolean;
}

export interface Platform extends Entity {
  type: 'normal' | 'hazard' | 'goal';
}

export interface Enemy extends Entity {
  type: 'patrol' | 'flying';
  speed: number;
  patrolDistance: number;
  startPosition: Vector2D;
  direction: number;
  damage: number;
}

export interface TimeSnapshot {
  playerPosition: Vector2D;
  playerVelocity: Vector2D;
  timestamp: number;
}

export function checkCollision(entityA: Entity, entityB: Entity): boolean {
  // Increased buffer for more forgiving collisions
  const buffer = 5;
  return (
    entityA.position.x + buffer < entityB.position.x + entityB.size.width &&
    entityA.position.x + entityA.size.width - buffer > entityB.position.x &&
    entityA.position.y + buffer < entityB.position.y + entityB.size.height &&
    entityA.position.y + entityA.size.height - buffer > entityB.position.y
  );
}

export function drawEntity(ctx: CanvasRenderingContext2D, entity: Entity) {
  ctx.fillStyle = entity.color;
  ctx.fillRect(
    Math.round(entity.position.x),
    Math.round(entity.position.y),
    entity.size.width,
    entity.size.height
  );
}

export function drawPlayer(ctx: CanvasRenderingContext2D, player: Player) {
  // Round positions for pixel-perfect rendering
  const x = Math.round(player.position.x);
  const y = Math.round(player.position.y);
  
  // Main body
  ctx.fillStyle = player.color;
  ctx.fillRect(x, y, player.size.width, player.size.height);
  
  // Eye direction indicator
  const eyeSize = player.size.width * 0.2;
  const eyeY = y + player.size.height * 0.2;
  
  ctx.fillStyle = '#ffffff';
  
  // Left eye
  ctx.fillRect(
    x + player.size.width * 0.2,
    eyeY,
    eyeSize,
    eyeSize
  );
  
  // Right eye
  ctx.fillRect(
    x + player.size.width * 0.6,
    eyeY,
    eyeSize,
    eyeSize
  );
  
  // Pupils - showing direction
  ctx.fillStyle = '#000000';
  const pupilOffset = player.direction === 1 ? eyeSize * 0.5 : eyeSize * 0.1;
  
  // Left pupil
  ctx.fillRect(
    x + player.size.width * 0.2 + pupilOffset,
    eyeY + eyeSize * 0.25,
    eyeSize * 0.5,
    eyeSize * 0.5
  );
  
  // Right pupil
  ctx.fillRect(
    x + player.size.width * 0.6 + pupilOffset,
    eyeY + eyeSize * 0.25,
    eyeSize * 0.5,
    eyeSize * 0.5
  );
}

export function drawPlatform(ctx: CanvasRenderingContext2D, platform: Platform) {
  const x = Math.round(platform.position.x);
  const y = Math.round(platform.position.y);
  
  switch (platform.type) {
    case 'hazard':
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x, y, platform.size.width, platform.size.height);
      
      ctx.fillStyle = '#b91c1c';
      const spikeWidth = 10;
      const spikeCount = Math.floor(platform.size.width / spikeWidth);
      
      for (let i = 0; i < spikeCount; i++) {
        const spikeX = x + i * spikeWidth;
        
        ctx.beginPath();
        ctx.moveTo(spikeX, y);
        ctx.lineTo(spikeX + spikeWidth / 2, y - 8);
        ctx.lineTo(spikeX + spikeWidth, y);
        ctx.fill();
      }
      break;
      
    case 'goal':
      ctx.fillStyle = '#22c55e';
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = 15;
      ctx.fillRect(x, y, platform.size.width, platform.size.height);
      ctx.shadowBlur = 0;
      
      ctx.fillStyle = '#4ade80';
      for (let i = 0; i < 3; i++) {
        const effectY = y - 5 - i * 7;
        const width = platform.size.width - i * 10;
        const effectX = x + (platform.size.width - width) / 2;
        ctx.fillRect(effectX, effectY, width, 5);
      }
      break;
      
    case 'normal':
    default:
      ctx.fillStyle = platform.color;
      ctx.fillRect(x, y, platform.size.width, platform.size.height);
      
      ctx.fillStyle = '#374151';
      ctx.fillRect(x, y + platform.size.height - 4, platform.size.width, 4);
      break;
  }
}

export function drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy) {
  const x = Math.round(enemy.position.x);
  const y = Math.round(enemy.position.y);
  
  switch (enemy.type) {
    case 'flying':
      ctx.fillStyle = enemy.color;
      
      const centerX = x + enemy.size.width / 2;
      const centerY = y + enemy.size.height / 2;
      const radius = enemy.size.width / 2;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#9f7aea';
      const wingOffset = Math.sin(Date.now() / 100) * 5;
      
      ctx.beginPath();
      ctx.ellipse(
        centerX - radius,
        centerY + wingOffset,
        radius * 0.8,
        radius * 0.4,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      ctx.beginPath();
      ctx.ellipse(
        centerX + radius,
        centerY + wingOffset,
        radius * 0.8,
        radius * 0.4,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(centerX - radius * 0.3, centerY - radius * 0.2, radius * 0.2, 0, Math.PI * 2);
      ctx.arc(centerX + radius * 0.3, centerY - radius * 0.2, radius * 0.2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(centerX - radius * 0.3, centerY - radius * 0.2, radius * 0.1, 0, Math.PI * 2);
      ctx.arc(centerX + radius * 0.3, centerY - radius * 0.2, radius * 0.1, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'patrol':
    default:
      ctx.fillStyle = enemy.color;
      ctx.fillRect(x, y, enemy.size.width, enemy.size.height);
      
      const eyeSize = enemy.size.width * 0.15;
      const eyeY = y + enemy.size.height * 0.2;
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + enemy.size.width * 0.25, eyeY, eyeSize, eyeSize);
      ctx.fillRect(x + enemy.size.width * 0.6, eyeY, eyeSize, eyeSize);
      
      ctx.fillStyle = '#ff0000';
      const pupilOffset = enemy.direction === 1 ? eyeSize * 0.5 : 0;
      ctx.fillRect(x + enemy.size.width * 0.25 + pupilOffset, eyeY, eyeSize * 0.5, eyeSize);
      ctx.fillRect(x + enemy.size.width * 0.6 + pupilOffset, eyeY, eyeSize * 0.5, eyeSize);
      
      ctx.fillStyle = '#ffffff';
      const teethWidth = enemy.size.width * 0.1;
      const teethHeight = enemy.size.height * 0.1;
      const teethY = y + enemy.size.height * 0.6;
      
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(
          x + enemy.size.width * 0.2 + i * teethWidth * 1.5,
          teethY,
          teethWidth,
          teethHeight
        );
      }
      break;
  }
}

export function drawTimeTrail(ctx: CanvasRenderingContext2D, history: TimeSnapshot[], playerSize: { width: number; height: number }) {
  if (!history.length) return;
  
  // Only draw trail during rewind
  const trailLength = Math.min(10, history.length);
  const step = Math.max(1, Math.floor(history.length / trailLength));
  
  for (let i = history.length - 1; i >= 0; i -= step) {
    const snapshot = history[i];
    const alpha = (i / history.length) * 0.3;
    
    ctx.fillStyle = `rgba(74, 222, 128, ${alpha})`;
    ctx.fillRect(
      Math.round(snapshot.playerPosition.x),
      Math.round(snapshot.playerPosition.y),
      playerSize.width,
      playerSize.height
    );
  }
}