import { generateLevel } from './levelGenerator';
import { Entity, Platform, Enemy, Player, TimeSnapshot } from './entities';

export type Vector2D = {
  x: number;
  y: number;
};

export interface GameState {
  width: number;
  height: number;
  player: Player;
  platforms: Platform[];
  enemies: Enemy[];
  level: number;
  levelComplete: boolean;
  gravity: number;
  rewindEnergy: number;
  maxRewindEnergy: number;
  rewindEnergyRechargeRate: number;
  isRewinding: boolean;
  timeHistory: TimeSnapshot[];
  maxHistoryLength: number;
}

export const initialGameState: GameState = {
  width: 800,
  height: 600,
  player: {
    position: { x: 100, y: 100 },
    velocity: { x: 0, y: 0 },
    size: { width: 30, height: 50 },
    speed: 300,
    jumpForce: 350, // Lower jump force for more control
    isJumping: false,
    isOnGround: false,
    direction: 1,
    health: 100,
    color: '#4ade80',
    canDoubleJump: true, // Add double jump capability
  },
  platforms: [],
  enemies: [],
  level: 1,
  levelComplete: false,
  gravity: 600, // Reduced gravity for better control
  rewindEnergy: 100,
  maxRewindEnergy: 100,
  rewindEnergyRechargeRate: 20,
  isRewinding: false,
  timeHistory: [],
  maxHistoryLength: 120
};

type GameAction = 
  | { type: 'UPDATE_GAME'; payload: GameState }
  | { type: 'MOVE_PLAYER'; payload: { direction: number } }
  | { type: 'JUMP_PLAYER' }
  | { type: 'START_REWIND' }
  | { type: 'STOP_REWIND' }
  | { type: 'NEXT_LEVEL' }
  | { type: 'RESET_GAME' }
  | { type: 'UPDATE_DIMENSIONS'; payload: { width: number; height: number } };

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'UPDATE_GAME':
      return action.payload;
      
    case 'MOVE_PLAYER':
      return {
        ...state,
        player: {
          ...state.player,
          velocity: {
            ...state.player.velocity,
            x: action.payload.direction * state.player.speed
          },
          direction: action.payload.direction !== 0 ? action.payload.direction : state.player.direction
        }
      };
      
    case 'JUMP_PLAYER':
      // Allow jump if on ground or can double jump
      if (!state.player.isOnGround && !state.player.canDoubleJump) return state;
      
      return {
        ...state,
        player: {
          ...state.player,
          velocity: {
            ...state.player.velocity,
            y: -state.player.jumpForce
          },
          isJumping: true,
          isOnGround: false,
          canDoubleJump: state.player.isOnGround // Only allow double jump if starting from ground
        }
      };
      
    case 'START_REWIND':
      if (state.rewindEnergy <= 0) return state;
      
      return {
        ...state,
        isRewinding: true
      };
      
    case 'STOP_REWIND':
      return {
        ...state,
        isRewinding: false,
        timeHistory: []
      };
      
    case 'NEXT_LEVEL':
      const newLevel = state.level + 1;
      const newLevelState = generateLevel(newLevel, state.width, state.height);
      
      return {
        ...initialGameState,
        ...newLevelState,
        level: newLevel,
        width: state.width,
        height: state.height,
        levelComplete: false
      };
      
    case 'RESET_GAME':
      const resetState = generateLevel(1, state.width, state.height);
      
      return {
        ...initialGameState,
        ...resetState,
        width: state.width,
        height: state.height
      };
      
    case 'UPDATE_DIMENSIONS':
      const { width, height } = action.payload;
      const updatedState = generateLevel(state.level, width, height);
      
      return {
        ...state,
        ...updatedState,
        width,
        height
      };
      
    default:
      return state;
  }
}