/**
 * AI Engine for Nine Men's Morris
 * 
 * Implements Minimax algorithm with Alpha-Beta pruning
 * for computer opponent
 */

import {
  GameState,
  GamePhase,
  placePiece,
  movePiece,
  removePiece,
  checkMill,
  getLegalMoves,
  getOpponent,
  countPieces,
  hasLegalMoves,
  getPositionsInMills,
  canRemovePiece,
} from './gameLogic';
import { Position, Player, adjacencyList, millCombinations } from './boardConfig';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface AIMove {
  type: 'place' | 'move' | 'remove';
  from?: Position;
  to: Position;
  score: number;
}

export interface AIConfig {
  difficulty: Difficulty;
  maxDepth: number;
  useAlphaBeta: boolean;
}

// Difficulty configurations - Enhanced depths
export const AI_CONFIGS: Record<Difficulty, AIConfig> = {
  easy: {
    difficulty: 'easy',
    maxDepth: 2,
    useAlphaBeta: true,
  },
  medium: {
    difficulty: 'medium',
    maxDepth: 4,
    useAlphaBeta: true,
  },
  hard: {
    difficulty: 'hard',
    maxDepth: 6,
    useAlphaBeta: true,
  },
};

/**
 * Generate all possible moves for the current game state
 */
export function generateMoves(gameState: GameState, player: Player): AIMove[] {
  if (!player) return [];

  const { board, phase, piecesRemaining, piecesOnBoard } = gameState;
  const moves: AIMove[] = [];

  switch (phase) {
    case 'placing':
      // Generate all possible placement moves
      for (let pos = 0; pos < 24; pos++) {
        if (board[pos] === null) {
          moves.push({
            type: 'place',
            to: pos,
            score: 0,
          });
        }
      }
      break;

    case 'moving':
    case 'flying':
      // Generate all possible movement moves
      const isFlying = piecesOnBoard[player] === 3;
      const playerPositions = Object.keys(board)
        .map(Number)
        .filter((pos) => board[pos] === player);

      for (const from of playerPositions) {
        const legalMoves = getLegalMoves(board, from, isFlying);
        for (const to of legalMoves) {
          moves.push({
            type: 'move',
            from,
            to,
            score: 0,
          });
        }
      }
      break;

    case 'removing':
      // Generate all possible removal moves
      const opponent = getOpponent(player);
      if (!opponent) break;

      const opponentPositions = Object.keys(board)
        .map(Number)
        .filter((pos) => board[pos] === opponent);

      for (const pos of opponentPositions) {
        if (canRemovePiece(board, pos, opponent)) {
          moves.push({
            type: 'remove',
            to: pos,
            score: 0,
          });
        }
      }
      break;
  }

  return moves;
}

/**
 * Apply a move to the game state and return new state
 */
function applyMove(gameState: GameState, move: AIMove, player: Player): GameState {
  let newState: GameState = { ...gameState };

  switch (move.type) {
    case 'place':
      newState = placePiece(gameState, move.to);
      break;

    case 'move':
      if (move.from !== undefined) {
        newState = movePiece(gameState, move.from, move.to);
      }
      break;

    case 'remove':
      newState = removePiece(gameState, move.to);
      break;
  }

  return newState;
}

/**
 * Evaluate board position for a player
 * Returns positive score if good for player, negative if bad
 */
export function evaluateBoard(gameState: GameState, player: Player): number {
  if (!player) return 0;

  const { board, phase, piecesOnBoard, piecesRemaining } = gameState;
  const opponent = getOpponent(player);
  if (!opponent) return 0;

  let score = 0;

  // Weight factors
  const WEIGHT_PIECE = 100;
  const WEIGHT_MILL = 50;
  const WEIGHT_POTENTIAL_MILL = 20;
  const WEIGHT_MOBILITY = 10;
  const WEIGHT_BLOCKED = -15;
  const WEIGHT_CENTER = 5;

  // 1. Piece count advantage
  const pieceDiff = piecesOnBoard[player] - piecesOnBoard[opponent];
  score += pieceDiff * WEIGHT_PIECE;

  // Pieces remaining to place
  const remainingDiff = piecesRemaining[opponent] - piecesRemaining[player];
  score += remainingDiff * (WEIGHT_PIECE / 2);

  // 2. Mills formed
  const playerMills = countMills(board, player);
  const opponentMills = countMills(board, opponent);
  score += (playerMills - opponentMills) * WEIGHT_MILL;

  // 3. Potential mills (2 in a row with empty third)
  const playerPotentialMills = countPotentialMills(board, player);
  const opponentPotentialMills = countPotentialMills(board, opponent);
  score += (playerPotentialMills - opponentPotentialMills) * WEIGHT_POTENTIAL_MILL;

  // 4. Mobility (number of legal moves)
  if (phase !== 'placing') {
    const playerMobility = countMobility(board, player, piecesOnBoard[player] === 3);
    const opponentMobility = countMobility(board, opponent, piecesOnBoard[opponent] === 3);
    score += (playerMobility - opponentMobility) * WEIGHT_MOBILITY;
  }

  // 5. Blocked opponent pieces
  const opponentBlocked = countBlockedPieces(board, opponent);
  score += opponentBlocked * WEIGHT_BLOCKED;

  // 6. Center control (positions 4, 7, 16, 19)
  const centerPositions = [4, 7, 16, 19];
  const playerCenter = centerPositions.filter((pos) => board[pos] === player).length;
  const opponentCenter = centerPositions.filter((pos) => board[pos] === opponent).length;
  score += (playerCenter - opponentCenter) * WEIGHT_CENTER;

  // 7. Win/Loss detection
  if (piecesOnBoard[opponent] <= 2 && piecesRemaining[opponent] === 0) {
    score += 10000; // Win
  }
  if (piecesOnBoard[player] <= 2 && piecesRemaining[player] === 0) {
    score -= 10000; // Loss
  }

  // No legal moves
  if (phase !== 'placing') {
    if (!hasLegalMoves(board, opponent, piecesOnBoard[opponent] === 3)) {
      score += 10000; // Win
    }
    if (!hasLegalMoves(board, player, piecesOnBoard[player] === 3)) {
      score -= 10000; // Loss
    }
  }

  return score;
}

/**
 * Count number of mills for a player
 */
function countMills(board: Record<Position, Player>, player: Player): number {
  let count = 0;
  for (const mill of millCombinations) {
    if (mill.every((pos) => board[pos] === player)) {
      count++;
    }
  }
  return count;
}

/**
 * Count potential mills (2 pieces with empty third spot)
 */
function countPotentialMills(board: Record<Position, Player>, player: Player): number {
  let count = 0;
  for (const mill of millCombinations) {
    const pieces = mill.filter((pos) => board[pos] === player).length;
    const empty = mill.filter((pos) => board[pos] === null).length;
    if (pieces === 2 && empty === 1) {
      count++;
    }
  }
  return count;
}

/**
 * Count mobility (number of legal moves available)
 */
function countMobility(
  board: Record<Position, Player>,
  player: Player,
  isFlying: boolean
): number {
  const playerPositions = Object.keys(board)
    .map(Number)
    .filter((pos) => board[pos] === player);

  let totalMoves = 0;
  for (const pos of playerPositions) {
    totalMoves += getLegalMoves(board, pos, isFlying).length;
  }
  return totalMoves;
}

/**
 * Count blocked pieces (pieces with no legal moves)
 */
function countBlockedPieces(board: Record<Position, Player>, player: Player): number {
  const playerPositions = Object.keys(board)
    .map(Number)
    .filter((pos) => board[pos] === player);

  let blocked = 0;
  for (const pos of playerPositions) {
    if (getLegalMoves(board, pos, false).length === 0) {
      blocked++;
    }
  }
  return blocked;
}

/**
 * Minimax algorithm with Alpha-Beta pruning
 */
export function minimax(
  gameState: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  aiPlayer: Player,
  useAlphaBeta: boolean = true
): number {
  // Terminal conditions
  if (depth === 0 || gameState.phase === 'gameOver') {
    return evaluateBoard(gameState, aiPlayer);
  }

  const currentPlayer = maximizingPlayer ? aiPlayer : getOpponent(aiPlayer);
  if (!currentPlayer) return 0;

  const moves = generateMoves(gameState, currentPlayer);
  
  if (moves.length === 0) {
    return evaluateBoard(gameState, aiPlayer);
  }

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newState = applyMove(gameState, move, currentPlayer);
      const evaluation = minimax(newState, depth - 1, alpha, beta, false, aiPlayer, useAlphaBeta);
      maxEval = Math.max(maxEval, evaluation);
      
      if (useAlphaBeta) {
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break; // Beta cutoff
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newState = applyMove(gameState, move, currentPlayer);
      const evaluation = minimax(newState, depth - 1, alpha, beta, true, aiPlayer, useAlphaBeta);
      minEval = Math.min(minEval, evaluation);
      
      if (useAlphaBeta) {
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break; // Alpha cutoff
      }
    }
    return minEval;
  }
}

/**
 * Get the best move for AI using Minimax with Alpha-Beta pruning
 */
export function getBestMove(
  gameState: GameState,
  aiPlayer: Player,
  config: AIConfig = AI_CONFIGS.medium
): AIMove | null {
  if (!aiPlayer) return null;

  const moves = generateMoves(gameState, aiPlayer);
  if (moves.length === 0) return null;

  // Add randomness for easy difficulty
  if (config.difficulty === 'easy' && Math.random() < 0.3) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  let bestMove: AIMove | null = null;
  let bestScore = -Infinity;
  const alpha = -Infinity;
  const beta = Infinity;

  // Evaluate each possible move
  for (const move of moves) {
    const newState = applyMove(gameState, move, aiPlayer);
    const score = minimax(
      newState,
      config.maxDepth - 1,
      alpha,
      beta,
      false,
      aiPlayer,
      config.useAlphaBeta
    );

    move.score = score;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

/**
 * Get AI move with difficulty consideration
 */
export function getAIMove(
  gameState: GameState,
  aiPlayer: Player,
  difficulty: Difficulty = 'medium'
): AIMove | null {
  const config = AI_CONFIGS[difficulty];
  return getBestMove(gameState, aiPlayer, config);
}
