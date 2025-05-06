import { GameState, Vector2D } from './gameState';
import { checkCollision, TimeSnapshot } from './entities';

// Main game update function
export function updateGame(gameState: GameState, deltaTime: number): GameState {
  // Limit delta time to prevent large jumps
  const cappedDeltaTime = Math.min(deltaTime, 0.016);
  
  if (gameState.isRewinding) {
    return handleTimeRewind(gameState, cappedDeltaTime);
  }
  
  // Record current position for time rewind (only when moving)
  const newTimeHistory = [...gameState.timeHistory];
  const isMoving = Math.abs(gameState.player.velocity.x) > 0 || Math.abs(gameState.player.velocity.y) > 0;
  
  if (isMoving) {
    if (newTimeHistory.length >= gameState.maxHistoryLength) {
      newTimeHistory.shift();
    }
    
    newTimeHistory.push({
      playerPosition: { ...gameState.player.position },
      playerVelocity: { ...gameState.player.velocity },
      timestamp: Date.now()
    });
  }
  
  // Update player position with improved physics
  const updatedPlayer = updatePlayerPosition(gameState, cappedDeltaTime);
  
  // Update enemy positions
  const updatedEnemies = updateEnemies(gameState, cappedDeltaTime);
  
  // Check for collisions
  const collisionState = handleCollisions({
    ...gameState,
    player: updatedPlayer,
    enemies: updatedEnemies,
    timeHistory: newTimeHistory
  });
  
  // Check if level is complete
  const isLevelComplete = checkLevelComplete(collisionState);
  
  // Recharge rewind energy if not rewinding
  const rewindEnergy = Math.min(
    gameState.maxRewindEnergy,
    gameState.rewindEnergy + (gameState.rewindEnergyRechargeRate * cappedDeltaTime)
  );
  
  return {
    ...collisionState,
    levelComplete: isLevelComplete,
    rewindEnergy
  };
}

// Update player position based on velocity and gravity
function updatePlayerPosition(gameState: GameState, deltaTime: number) {
  const { player, gravity } = gameState;
  
  // Apply gravity with improved air control
  const gravityEffect = player.isOnGround ? 0 : gravity;
  const airResistance = player.isOnGround ? 0.9 : 0.95; // Increased air control
  
  // Calculate new velocity with improved air control
  const velocityX = player.velocity.x * airResistance;
  const velocityY = player.isOnGround 
    ? 0 
    : Math.min(600, player.velocity.y + gravityEffect * deltaTime); // Lower terminal velocity
  
  // Calculate new position with improved movement
  const newPosition: Vector2D = {
    x: player.position.x + velocityX * deltaTime,
    y: player.position.y + velocityY * deltaTime
  };
  
  // Keep player within game bounds with smooth clamping
  const boundedPosition: Vector2D = {
    x: Math.max(0, Math.min(gameState.width - player.size.width, newPosition.x)),
    y: Math.max(0, Math.min(gameState.height - player.size.height, newPosition.y))
  };
  
  // Reset isOnGround if player is moving upward
  const isOnGround = player.isOnGround && velocityY >= 0;
  
  // Reset double jump when touching ground
  const canDoubleJump = isOnGround ? true : player.canDoubleJump;
  
  return {
    ...player,
    position: boundedPosition,
    velocity: {
      x: velocityX,
      y: velocityY
    },
    isOnGround,
    canDoubleJump
  };
}

// Handle time rewind with smoother transitions
function handleTimeRewind(gameState: GameState, deltaTime: number): GameState {
  const { timeHistory, rewindEnergy } = gameState;
  
  // If no history or out of energy, stop rewinding
  if (timeHistory.length === 0 || rewindEnergy <= 0) {
    return {
      ...gameState,
      isRewinding: false
    };
  }
  
  // Calculate rewind speed based on remaining energy
  const rewindSpeed = Math.max(1, Math.min(3, rewindEnergy / 20));
  const snapshots = Math.ceil(rewindSpeed);
  
  // Get previous positions from history
  let newHistory = [...timeHistory];
  let targetSnapshot = null;
  
  for (let i = 0; i < snapshots && newHistory.length > 0; i++) {
    targetSnapshot = newHistory[newHistory.length - 1];
    newHistory = newHistory.slice(0, -1);
  }
  
  if (!targetSnapshot) {
    return {
      ...gameState,
      isRewinding: false
    };
  }
  
  // Calculate energy cost (higher cost for faster rewind)
  const energyCost = 40 * deltaTime * rewindSpeed;
  const remainingEnergy = Math.max(0, rewindEnergy - energyCost);
  
  // If out of energy after this update, stop rewinding
  const stillRewinding = remainingEnergy > 0;
  
  return {
    ...gameState,
    player: {
      ...gameState.player,
      position: { ...targetSnapshot.playerPosition },
      velocity: { x: 0, y: 0 }, // Reset velocity for smoother transitions
      isOnGround: false // Reset ground state during rewind
    },
    timeHistory: newHistory,
    rewindEnergy: remainingEnergy,
    isRewinding: stillRewinding
  };
}

function updateEnemies(gameState: GameState, deltaTime: number) {
  return gameState.enemies.map(enemy => {
    switch (enemy.type) {
      case 'patrol':
        const distanceMoved = Math.abs(enemy.position.x - enemy.startPosition.x);
        
        if (distanceMoved >= enemy.patrolDistance) {
          enemy.direction *= -1;
        }
        
        return {
          ...enemy,
          position: {
            x: enemy.position.x + enemy.speed * enemy.direction * deltaTime,
            y: enemy.position.y
          }
        };
        
      case 'flying':
        const timeOffset = Date.now() / 1000;
        const verticalOffset = Math.sin(timeOffset * 2) * 30;
        
        return {
          ...enemy,
          position: {
            x: enemy.position.x + enemy.speed * enemy.direction * deltaTime,
            y: enemy.startPosition.y + verticalOffset
          },
          direction: 
            (enemy.position.x <= 0 && enemy.direction < 0) || 
            (enemy.position.x + enemy.size.width >= gameState.width && enemy.direction > 0)
              ? -enemy.direction
              : enemy.direction
        };
        
      default:
        return enemy;
    }
  });
}

function handleCollisions(gameState: GameState) {
  const { player, platforms, enemies } = gameState;
  
  let updatedPlayer = { ...player };
  let isOnPlatform = false;
  
  // Add small buffer for more forgiving platform collisions
  const collisionBuffer = 5;
  
  for (const platform of platforms) {
    if (checkCollision(updatedPlayer, platform)) {
      const playerBottom = updatedPlayer.position.y + updatedPlayer.size.height;
      const playerTop = updatedPlayer.position.y;
      const platformTop = platform.position.y;
      const platformBottom = platform.position.y + platform.size.height;
      
      // More forgiving ground detection
      if (updatedPlayer.velocity.y > 0 && 
          playerBottom >= platformTop - collisionBuffer && 
          playerBottom - updatedPlayer.velocity.y * 0.1 <= platformTop + collisionBuffer) {
        updatedPlayer.position.y = platformTop - updatedPlayer.size.height;
        updatedPlayer.velocity.y = 0;
        updatedPlayer.isJumping = false;
        updatedPlayer.isOnGround = true;
        isOnPlatform = true;
        
        if (platform.type === 'hazard') {
          updatedPlayer.health -= 25;
        }
      } else if (updatedPlayer.velocity.y < 0 && playerTop <= platformBottom && playerTop - updatedPlayer.velocity.y * 0.1 >= platformBottom) {
        updatedPlayer.position.y = platformBottom;
        updatedPlayer.velocity.y = 0;
      } else {
        const playerRight = updatedPlayer.position.x + updatedPlayer.size.width;
        const playerLeft = updatedPlayer.position.x;
        const platformRight = platform.position.x + platform.size.width;
        const platformLeft = platform.position.x;
        
        if (playerRight >= platformLeft && playerLeft < platformLeft) {
          updatedPlayer.position.x = platformLeft - updatedPlayer.size.width;
          updatedPlayer.velocity.x *= 0.5; // Reduce bounce on side collision
        } else if (playerLeft <= platformRight && playerRight > platformRight) {
          updatedPlayer.position.x = platformRight;
          updatedPlayer.velocity.x *= 0.5; // Reduce bounce on side collision
        }
      }
    }
  }
  
  if (!isOnPlatform && updatedPlayer.isOnGround) {
    updatedPlayer.isOnGround = false;
  }
  
  let playerHealth = updatedPlayer.health;
  
  // More forgiving enemy collisions
  for (const enemy of enemies) {
    if (checkCollision(updatedPlayer, enemy)) {
      playerHealth -= enemy.damage;
      
      const knockbackDirection = updatedPlayer.position.x < enemy.position.x ? -1 : 1;
      updatedPlayer.velocity.x = knockbackDirection * 150; // Reduced knockback
      updatedPlayer.velocity.y = -150; // Reduced vertical knockback
    }
  }
  
  return {
    ...gameState,
    player: {
      ...updatedPlayer,
      health: playerHealth
    }
  };
}

function checkLevelComplete(gameState: GameState): boolean {
  const { player, platforms } = gameState;
  const goalPlatform = platforms.find(platform => platform.type === 'goal');
  
  if (!goalPlatform) return false;
  
  // More forgiving goal detection with a small buffer
  const buffer = 5;
  const playerRight = player.position.x + player.size.width;
  const playerLeft = player.position.x;
  const goalRight = goalPlatform.position.x + goalPlatform.size.width;
  const goalLeft = goalPlatform.position.x;
  
  return (
    playerRight >= goalLeft - buffer &&
    playerLeft <= goalRight + buffer &&
    Math.abs(player.position.y + player.size.height - goalPlatform.position.y) < buffer * 2
  );
}