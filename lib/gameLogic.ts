import {
  BoardState,
  Player,
  Position,
  adjacencyList,
  millCombinations,
  PIECES_PER_PLAYER,
} from './boardConfig';

export type GamePhase = 'placing' | 'moving' | 'flying' | 'removing' | 'gameOver';

export interface GameState {
  board: BoardState;
  currentPlayer: Player;
  phase: GamePhase;
  piecesRemaining: {
    white: number;
    black: number;
  };
  piecesOnBoard: {
    white: number;
    black: number;
  };
  selectedPosition: Position | null;
  millFormed: boolean;
  winner: Player;
  message: string;
}

/**
 * Initialize a new game state
 */
export function initializeGame(): GameState {
  const board: BoardState = {};
  for (let i = 0; i < 24; i++) {
    board[i] = null;
  }

  return {
    board,
    currentPlayer: 'white',
    phase: 'placing',
    piecesRemaining: {
      white: PIECES_PER_PLAYER,
      black: PIECES_PER_PLAYER,
    },
    piecesOnBoard: {
      white: 0,
      black: 0,
    },
    selectedPosition: null,
    millFormed: false,
    winner: null,
    message: "White's turn - Place a piece",
  };
}

/**
 * Check if a mill is formed at the given position for the given player
 */
export function checkMill(board: BoardState, position: Position, player: Player): boolean {
  if (!player) return false;

  // Check all mill combinations that include this position
  return millCombinations.some((mill) => {
    if (!mill.includes(position)) return false;
    
    // Check if all positions in this mill belong to the same player
    return mill.every((pos) => board[pos] === player);
  });
}

/**
 * Get all positions that are part of a mill for a given player
 */
export function getPositionsInMills(board: BoardState, player: Player): Set<Position> {
  const inMill = new Set<Position>();
  
  millCombinations.forEach((mill) => {
    if (mill.every((pos) => board[pos] === player)) {
      mill.forEach((pos) => inMill.add(pos));
    }
  });
  
  return inMill;
}

/**
 * Check if a piece can be removed (not in a mill, unless all pieces are in mills)
 */
export function canRemovePiece(
  board: BoardState,
  position: Position,
  player: Player
): boolean {
  if (board[position] !== player) return false;

  const inMill = getPositionsInMills(board, player);
  
  // If the piece is not in a mill, it can be removed
  if (!inMill.has(position)) return true;

  // If all opponent pieces are in mills, any can be removed
  const opponentPositions = Object.keys(board)
    .map(Number)
    .filter((pos) => board[pos] === player);
  
  return opponentPositions.every((pos) => inMill.has(pos));
}

/**
 * Get opponent player
 */
export function getOpponent(player: Player): Player {
  if (player === 'white') return 'black';
  if (player === 'black') return 'white';
  return null;
}

/**
 * Count pieces on board for a player
 */
export function countPieces(board: BoardState, player: Player): number {
  return Object.values(board).filter((p) => p === player).length;
}

/**
 * Get legal moves for a position during moving phase
 */
export function getLegalMoves(
  board: BoardState,
  position: Position,
  isFlying: boolean
): Position[] {
  if (board[position] === null) return [];

  if (isFlying) {
    // Can move to any empty position
    return Object.keys(board)
      .map(Number)
      .filter((pos) => board[pos] === null);
  } else {
    // Can only move to adjacent empty positions
    return adjacencyList[position].filter((pos) => board[pos] === null);
  }
}

/**
 * Check if a player has any legal moves
 */
export function hasLegalMoves(board: BoardState, player: Player, isFlying: boolean): boolean {
  const playerPositions = Object.keys(board)
    .map(Number)
    .filter((pos) => board[pos] === player);

  return playerPositions.some((pos) => getLegalMoves(board, pos, isFlying).length > 0);
}

/**
 * Check win condition
 * A player wins if opponent has ≤2 pieces or no legal moves
 */
export function checkWinCondition(gameState: GameState): Player | null {
  const { board, phase, piecesOnBoard, currentPlayer } = gameState;
  
  // Can't win during placing phase
  if (phase === 'placing') return null;

  const opponent = getOpponent(currentPlayer);
  if (!opponent) return null;

  // Check if opponent has only 2 pieces left
  if (piecesOnBoard[opponent] <= 2) {
    return currentPlayer;
  }

  // Check if opponent has no legal moves
  const opponentFlying = piecesOnBoard[opponent] === 3;
  if (!hasLegalMoves(board, opponent, opponentFlying)) {
    return currentPlayer;
  }

  return null;
}

/**
 * Handle placing a piece
 */
export function placePiece(gameState: GameState, position: Position): GameState {
  const { board, currentPlayer, piecesRemaining, piecesOnBoard } = gameState;

  // Validate move
  if (board[position] !== null) {
    return { ...gameState, message: 'Position already occupied' };
  }

  if (!currentPlayer) return gameState;

  // Place the piece
  const newBoard = { ...board, [position]: currentPlayer };
  const newPiecesRemaining = {
    ...piecesRemaining,
    [currentPlayer]: piecesRemaining[currentPlayer] - 1,
  };
  const newPiecesOnBoard = {
    ...piecesOnBoard,
    [currentPlayer]: piecesOnBoard[currentPlayer] + 1,
  };

  // Check if mill formed
  const millFormed = checkMill(newBoard, position, currentPlayer);

  if (millFormed) {
    // Switch to removing phase
    return {
      ...gameState,
      board: newBoard,
      piecesRemaining: newPiecesRemaining,
      piecesOnBoard: newPiecesOnBoard,
      phase: 'removing',
      millFormed: true,
      message: `${currentPlayer} formed a mill! Remove an opponent's piece`,
    };
  }

  // Switch turns
  const nextPlayer = getOpponent(currentPlayer);
  const allPiecesPlaced = newPiecesRemaining.white === 0 && newPiecesRemaining.black === 0;
  const newPhase = allPiecesPlaced ? 'moving' : 'placing';

  return {
    ...gameState,
    board: newBoard,
    currentPlayer: nextPlayer,
    piecesRemaining: newPiecesRemaining,
    piecesOnBoard: newPiecesOnBoard,
    phase: newPhase,
    millFormed: false,
    message: `${nextPlayer}'s turn - ${newPhase === 'moving' ? 'Move a piece' : 'Place a piece'}`,
  };
}

/**
 * Handle removing an opponent's piece
 */
export function removePiece(gameState: GameState, position: Position): GameState {
  const { board, currentPlayer, piecesOnBoard } = gameState;
  const opponent = getOpponent(currentPlayer);

  // Validate removal
  if (!opponent || board[position] !== opponent) {
    return { ...gameState, message: "You can only remove opponent's pieces" };
  }

  if (!canRemovePiece(board, position, opponent)) {
    return { ...gameState, message: 'Cannot remove piece from a mill unless all pieces are in mills' };
  }

  // Remove the piece
  const newBoard = { ...board, [position]: null };
  const newPiecesOnBoard = {
    ...piecesOnBoard,
    [opponent]: piecesOnBoard[opponent] - 1,
  };

  // Check win condition
  if (newPiecesOnBoard[opponent] <= 2 && gameState.piecesRemaining[opponent] === 0) {
    return {
      ...gameState,
      board: newBoard,
      piecesOnBoard: newPiecesOnBoard,
      phase: 'gameOver',
      winner: currentPlayer,
      message: `${currentPlayer} wins!`,
    };
  }

  // Switch turns
  const nextPlayer = opponent;
  const allPiecesPlaced = gameState.piecesRemaining.white === 0 && gameState.piecesRemaining.black === 0;
  let newPhase: GamePhase = allPiecesPlaced ? 'moving' : 'placing';

  // Check if next player can fly (has exactly 3 pieces)
  if (newPhase === 'moving' && newPiecesOnBoard[nextPlayer] === 3) {
    newPhase = 'flying';
  }

  return {
    ...gameState,
    board: newBoard,
    currentPlayer: nextPlayer,
    piecesOnBoard: newPiecesOnBoard,
    phase: newPhase,
    millFormed: false,
    message: `${nextPlayer}'s turn - ${newPhase === 'placing' ? 'Place a piece' : newPhase === 'flying' ? 'Fly to any position' : 'Move a piece'}`,
  };
}

/**
 * Handle selecting a piece to move
 */
export function selectPiece(gameState: GameState, position: Position): GameState {
  const { board, currentPlayer, selectedPosition } = gameState;

  // If a position is already selected, try to move
  if (selectedPosition !== null) {
    return movePiece(gameState, selectedPosition, position);
  }

  // Validate selection
  if (board[position] !== currentPlayer) {
    return { ...gameState, message: 'Select your own piece' };
  }

  // Select the piece
  return {
    ...gameState,
    selectedPosition: position,
    message: `${currentPlayer}'s turn - Select destination`,
  };
}

/**
 * Handle moving a piece
 */
export function movePiece(gameState: GameState, from: Position, to: Position): GameState {
  const { board, currentPlayer, piecesOnBoard } = gameState;

  // Validate move
  if (board[from] !== currentPlayer) {
    return { ...gameState, message: 'Invalid move', selectedPosition: null };
  }

  if (board[to] !== null) {
    return { ...gameState, message: 'Position occupied', selectedPosition: null };
  }

  if (!currentPlayer) return gameState;

  const isFlying = piecesOnBoard[currentPlayer] === 3;
  const legalMoves = getLegalMoves(board, from, isFlying);

  if (!legalMoves.includes(to)) {
    return { ...gameState, message: 'Invalid move', selectedPosition: null };
  }

  // Move the piece
  const newBoard = { ...board, [from]: null, [to]: currentPlayer };

  // Check if mill formed
  const millFormed = checkMill(newBoard, to, currentPlayer);

  if (millFormed) {
    return {
      ...gameState,
      board: newBoard,
      phase: 'removing',
      selectedPosition: null,
      millFormed: true,
      message: `${currentPlayer} formed a mill! Remove an opponent's piece`,
    };
  }

  // Switch turns
  const nextPlayer = getOpponent(currentPlayer);
  if (!nextPlayer) return gameState;

  // Determine phase for next player
  let newPhase: GamePhase = piecesOnBoard[nextPlayer] === 3 ? 'flying' : 'moving';

  // Check win condition
  const winner = checkWinCondition({
    ...gameState,
    board: newBoard,
    currentPlayer: nextPlayer,
    phase: newPhase,
  });

  if (winner) {
    return {
      ...gameState,
      board: newBoard,
      phase: 'gameOver',
      winner,
      selectedPosition: null,
      message: `${winner} wins!`,
    };
  }

  return {
    ...gameState,
    board: newBoard,
    currentPlayer: nextPlayer,
    phase: newPhase,
    selectedPosition: null,
    millFormed: false,
    message: `${nextPlayer}'s turn - ${newPhase === 'flying' ? 'Fly to any position' : 'Move a piece'}`,
  };
}
