import { GameState, initialGameState } from './gameState';
import { Platform, Enemy } from './entities';

export function generateLevel(level: number, width: number, height: number): Partial<GameState> {
  const platformHeight = Math.max(20, height * 0.03);
  const smallPlatformWidth = Math.max(100, width * 0.15);
  const mediumPlatformWidth = Math.max(180, width * 0.25);
  const largePlatformWidth = Math.max(260, width * 0.35);
  
  const enemyCount = Math.min(2 + Math.floor(level / 2), 8);
  const hazardCount = Math.min(1 + Math.floor(level / 3), 4);
  const platformCount = 6 + Math.floor(level / 2);
  
  const platforms: Platform[] = [];
  
  // Ground platform
  platforms.push({
    position: { x: 0, y: height - platformHeight },
    velocity: { x: 0, y: 0 },
    size: { width, height: platformHeight },
    color: '#475569',
    type: 'normal'
  });
  
  // Starting platform
  const startPlatform: Platform = {
    position: { x: 40, y: height - platformHeight * 6 }, // Lower starting platform
    velocity: { x: 0, y: 0 },
    size: { width: mediumPlatformWidth, height: platformHeight },
    color: '#475569',
    type: 'normal'
  };
  platforms.push(startPlatform);
  
  // Goal platform - positioned based on level
  const goalHeight = Math.min(height * 0.4, height - (platformHeight * (8 + level)));
  const goalPlatform: Platform = {
    position: { x: width - smallPlatformWidth - 40, y: goalHeight },
    velocity: { x: 0, y: 0 },
    size: { width: smallPlatformWidth, height: platformHeight },
    color: '#10b981',
    type: 'goal'
  };
  
  // Calculate maximum jump height and distance
  const maxJumpHeight = 180; // Maximum height player can reach with a jump
  const maxJumpDistance = 200; // Maximum horizontal distance player can cover
  
  // Track used vertical zones to ensure platforms are reachable
  const verticalZones = [
    { y: startPlatform.position.y, platforms: [startPlatform] },
    { y: goalPlatform.position.y, platforms: [goalPlatform] }
  ];
  
  // Generate intermediate platforms with better spacing
  for (let i = 0; i < platformCount; i++) {
    let platformWidth: number;
    const sizeRandom = Math.random();
    
    if (sizeRandom < 0.4) platformWidth = smallPlatformWidth;
    else if (sizeRandom < 0.8) platformWidth = mediumPlatformWidth;
    else platformWidth = largePlatformWidth;
    
    let validPosition = false;
    let x = 0;
    let y = 0;
    let attempts = 0;
    
    while (!validPosition && attempts < 20) {
      attempts++;
      
      // Calculate y position ensuring reachable height differences
      const zoneIndex = Math.floor(i / (platformCount / 3));
      const minY = height * 0.2 + (zoneIndex * height * 0.2);
      const maxY = height * 0.8 - (2 - zoneIndex) * height * 0.2;
      
      // Get reference platform for positioning
      const prevPlatforms = platforms.filter(p => p.type !== 'goal');
      const referencePlatform = prevPlatforms[prevPlatforms.length - 1];
      
      if (referencePlatform) {
        // Calculate y position relative to previous platform
        const minJumpY = referencePlatform.position.y - maxJumpHeight;
        const maxJumpY = referencePlatform.position.y + maxJumpHeight / 2;
        y = Math.max(minY, Math.min(maxY, minJumpY + Math.random() * (maxJumpY - minJumpY)));
        
        // Calculate x position based on jump distance
        const minJumpDist = maxJumpDistance * 0.4;
        const maxJumpDist = maxJumpDistance * 0.8;
        x = referencePlatform.position.x + minJumpDist + Math.random() * (maxJumpDist - minJumpDist);
      } else {
        y = minY + Math.random() * (maxY - minY);
        x = width * 0.2 + Math.random() * (width * 0.6);
      }
      
      // Ensure platform is within bounds
      x = Math.max(40, Math.min(width - platformWidth - 40, x));
      
      validPosition = true;
      
      // Check collisions with existing platforms
      for (const platform of platforms) {
        const horizontalGap = Math.abs(x - platform.position.x);
        const verticalGap = Math.abs(y - platform.position.y);
        
        if (horizontalGap < platformWidth * 1.2 && verticalGap < platformHeight * 4) {
          validPosition = false;
          break;
        }
      }
      
      // Verify platform is reachable
      if (validPosition && referencePlatform) {
        const horizontalDist = Math.abs(x - referencePlatform.position.x);
        const verticalDist = Math.abs(y - referencePlatform.position.y);
        
        if (horizontalDist > maxJumpDistance || verticalDist > maxJumpHeight) {
          validPosition = false;
        }
      }
    }
    
    if (validPosition) {
      const isHazard = i < hazardCount;
      const platform: Platform = {
        position: { x, y },
        velocity: { x: 0, y: 0 },
        size: { width: platformWidth, height: platformHeight },
        color: isHazard ? '#ef4444' : '#475569',
        type: isHazard ? 'hazard' : 'normal'
      };
      
      platforms.push(platform);
      
      // Add to vertical zones
      const zoneY = Math.floor(y / (height / 3));
      let zone = verticalZones.find(z => Math.abs(z.y - y) < height * 0.2);
      if (!zone) {
        zone = { y, platforms: [] };
        verticalZones.push(zone);
      }
      zone.platforms.push(platform);
    }
  }
  
  // Add goal platform last
  platforms.push(goalPlatform);
  
  // Generate enemies on platforms
  const enemies: Enemy[] = [];
  const availablePlatforms = platforms.filter(p => 
    p.type === 'normal' && 
    p.size.width >= mediumPlatformWidth
  );
  
  for (let i = 0; i < enemyCount && availablePlatforms.length > 0; i++) {
    const platformIndex = Math.floor(Math.random() * availablePlatforms.length);
    const platform = availablePlatforms[platformIndex];
    availablePlatforms.splice(platformIndex, 1);
    
    const enemyWidth = 40;
    const enemyHeight = 40;
    const isFlyingEnemy = i < Math.floor(level / 3) && i < 2;
    
    if (isFlyingEnemy) {
      enemies.push({
        position: { 
          x: platform.position.x + platform.size.width / 2 - enemyWidth / 2,
          y: platform.position.y - enemyHeight - 40
        },
        velocity: { x: 0, y: 0 },
        size: { width: enemyWidth, height: enemyHeight },
        color: '#9333ea',
        type: 'flying',
        speed: 80 + level * 8,
        patrolDistance: platform.size.width + 80,
        startPosition: { 
          x: platform.position.x + platform.size.width / 2 - enemyWidth / 2,
          y: platform.position.y - enemyHeight - 40
        },
        direction: Math.random() > 0.5 ? 1 : -1,
        damage: 10 + level
      });
    } else {
      enemies.push({
        position: { 
          x: platform.position.x + platform.size.width / 2 - enemyWidth / 2,
          y: platform.position.y - enemyHeight
        },
        velocity: { x: 0, y: 0 },
        size: { width: enemyWidth, height: enemyHeight },
        color: '#7e22ce',
        type: 'patrol',
        speed: 60 + level * 5,
        patrolDistance: platform.size.width * 0.7,
        startPosition: { 
          x: platform.position.x,
          y: platform.position.y - enemyHeight
        },
        direction: 1,
        damage: 10
      });
    }
  }
  
  const playerStartX = startPlatform.position.x + 20;
  const playerStartY = startPlatform.position.y - initialGameState.player.size.height;
  
  return {
    platforms,
    enemies,
    player: {
      ...initialGameState.player,
      position: { x: playerStartX, y: playerStartY }
    },
    width,
    height,
    timeHistory: [],
    gravity: initialGameState.gravity + level * 5,
    maxRewindEnergy: initialGameState.maxRewindEnergy + (level * 5),
    rewindEnergyRechargeRate: initialGameState.rewindEnergyRechargeRate + (level * 0.2)
  };
}