import { GameState, placePiece, removePiece, selectPiece } from '@/lib/gameLogic';
import { getAIMove, Difficulty } from '@/lib/aiEngine';
import { Position, Player } from '@/lib/boardConfig';

export interface Hint {
  type: 'place' | 'move' | 'remove';
  from?: Position;
  to: Position;
  reason: string;
  priority: number;
}

/**
 * Generate a hint for the current player
 * Uses the AI engine to find the best move
 */
export async function generateHint(
  gameState: GameState,
  difficulty: Difficulty = 'medium'
): Promise<Hint | null> {
  const currentPlayer = gameState.currentPlayer;
  if (!currentPlayer) return null;

  // Use AI to get best move
  const aiMove = await getAIMove(gameState, currentPlayer, difficulty);
  
  if (!aiMove) return null;

  // Convert AI move to hint with explanation
  let reason = '';
  
  if (aiMove.type === 'place') {
    reason = getPlaceReason(gameState, aiMove.to);
  } else if (aiMove.type === 'move') {
    reason = getMoveReason(gameState, aiMove.from!, aiMove.to);
  } else if (aiMove.type === 'remove') {
    reason = getRemoveReason(gameState, aiMove.to);
  }

  return {
    type: aiMove.type,
    from: aiMove.from,
    to: aiMove.to,
    reason,
    priority: aiMove.score || 0,
  };
}

function getPlaceReason(gameState: GameState, position: Position): string {
  // Check if this move forms a mill
  const testState = placePiece(gameState, position);
  if (testState.phase === 'removing') {
    return `Place here to form a mill! You'll get to remove an opponent piece.`;
  }

  // Check if it blocks opponent mill
  const opponentPlayer: Player = gameState.currentPlayer === 'white' ? 'black' : 'white';
  // This is a simplified check - in reality you'd need more complex logic
  return `Strategic position that controls the center and gives you flexibility.`;
}

function getMoveReason(gameState: GameState, from: Position, to: Position): string {
  // Check if this move forms a mill
  let testState = selectPiece(gameState, from);
  testState = selectPiece(testState, to);
  
  if (testState.phase === 'removing') {
    return `Move from position ${from} to ${to} to form a mill!`;
  }

  return `Move from ${from} to ${to} for better position control.`;
}

function getRemoveReason(gameState: GameState, position: Position): string {
  return `Remove the piece at position ${position} to weaken your opponent's position.`;
}

/**
 * Get multiple hint options (top 3)
 */
export async function getHintOptions(
  gameState: GameState,
  count: number = 3
): Promise<Hint[]> {
  const hints: Hint[] = [];
  
  // Get hints at different difficulty levels for variety
  const difficulties: Difficulty[] = ['hard', 'medium', 'easy'];
  
  for (let i = 0; i < Math.min(count, difficulties.length); i++) {
    const hint = await generateHint(gameState, difficulties[i]);
    if (hint && !hints.some(h => h.to === hint.to && h.from === hint.from)) {
      hints.push(hint);
    }
  }
  
  return hints.sort((a, b) => b.priority - a.priority);
}
