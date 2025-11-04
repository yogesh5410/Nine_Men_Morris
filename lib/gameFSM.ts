/**
 * Finite State Machine for Nine Men's Morris Game
 * 
 * This module implements a proper FSM to manage game phases and transitions
 */

import { GameState, GamePhase } from './gameLogic';

export type GameEvent = 
  | 'PIECE_PLACED'
  | 'ALL_PIECES_PLACED'
  | 'MILL_FORMED'
  | 'PIECE_REMOVED'
  | 'PIECE_MOVED'
  | 'PLAYER_HAS_3_PIECES'
  | 'PLAYER_WINS'
  | 'GAME_RESET';

export interface FSMState {
  phase: GamePhase;
  allowedTransitions: GamePhase[];
  allowedActions: string[];
}

// Define FSM states and allowed transitions
export const FSM_STATES: Record<GamePhase, FSMState> = {
  placing: {
    phase: 'placing',
    allowedTransitions: ['removing', 'moving', 'gameOver'],
    allowedActions: ['placePiece'],
  },
  moving: {
    phase: 'moving',
    allowedTransitions: ['removing', 'flying', 'gameOver'],
    allowedActions: ['selectPiece', 'movePiece'],
  },
  flying: {
    phase: 'flying',
    allowedTransitions: ['removing', 'gameOver'],
    allowedActions: ['selectPiece', 'flyPiece'],
  },
  removing: {
    phase: 'removing',
    allowedTransitions: ['placing', 'moving', 'flying', 'gameOver'],
    allowedActions: ['removePiece'],
  },
  gameOver: {
    phase: 'gameOver',
    allowedTransitions: ['placing'], // Can restart
    allowedActions: ['resetGame'],
  },
};

/**
 * Get current FSM state
 */
export function getCurrentFSMState(phase: GamePhase): FSMState {
  return FSM_STATES[phase];
}

/**
 * Check if a phase transition is valid
 */
export function canTransitionTo(currentPhase: GamePhase, targetPhase: GamePhase): boolean {
  const currentState = FSM_STATES[currentPhase];
  return currentState.allowedTransitions.includes(targetPhase);
}

/**
 * Check if an action is allowed in current phase
 */
export function isActionAllowed(phase: GamePhase, action: string): boolean {
  const state = FSM_STATES[phase];
  return state.allowedActions.includes(action);
}

/**
 * Determine next phase based on event and game state
 */
export function getNextPhase(gameState: GameState, event: GameEvent): GamePhase {
  const { phase, piecesRemaining, piecesOnBoard } = gameState;

  switch (event) {
    case 'PIECE_PLACED':
      // Stay in placing phase
      return 'placing';

    case 'ALL_PIECES_PLACED':
      // Transition to moving phase
      return 'moving';

    case 'MILL_FORMED':
      // Transition to removing phase
      return 'removing';

    case 'PIECE_REMOVED':
      // Return to previous phase
      if (piecesRemaining.white === 0 && piecesRemaining.black === 0) {
        // All pieces placed, check for flying
        const currentPlayer = gameState.currentPlayer;
        if (currentPlayer && piecesOnBoard[currentPlayer] === 3) {
          return 'flying';
        }
        return 'moving';
      }
      return 'placing';

    case 'PIECE_MOVED':
      // Stay in moving/flying
      return phase === 'flying' ? 'flying' : 'moving';

    case 'PLAYER_HAS_3_PIECES':
      // Transition to flying phase
      return 'flying';

    case 'PLAYER_WINS':
      // Transition to game over
      return 'gameOver';

    case 'GAME_RESET':
      // Reset to placing
      return 'placing';

    default:
      return phase;
  }
}

/**
 * Validate state transition
 */
export function validateTransition(
  currentPhase: GamePhase,
  targetPhase: GamePhase
): { valid: boolean; error?: string } {
  if (!canTransitionTo(currentPhase, targetPhase)) {
    return {
      valid: false,
      error: `Invalid transition from ${currentPhase} to ${targetPhase}`,
    };
  }
  return { valid: true };
}

/**
 * Get phase description for UI
 */
export function getPhaseDescription(phase: GamePhase): string {
  switch (phase) {
    case 'placing':
      return 'Place your pieces on the board';
    case 'moving':
      return 'Move your pieces to adjacent positions';
    case 'flying':
      return 'Fly to any empty position';
    case 'removing':
      return 'Remove an opponent\'s piece';
    case 'gameOver':
      return 'Game Over';
    default:
      return '';
  }
}

/**
 * Get allowed actions for current phase
 */
export function getAllowedActions(phase: GamePhase): string[] {
  return FSM_STATES[phase].allowedActions;
}
