/**
 * Nine Men's Morris Board Configuration
 * 
 * The board consists of 24 positions arranged in 3 concentric squares.
 * Positions are numbered 0-23 as follows:
 * 
 *  0----------1----------2
 *  |          |          |
 *  |  3-------4-------5  |
 *  |  |       |       |  |
 *  |  |  6----7----8  |  |
 *  |  |  |         |  |  |
 *  9--10-11       12-13-14
 *  |  |  |         |  |  |
 *  |  |  15---16---17 |  |
 *  |  |       |       |  |
 *  |  18------19------20 |
 *  |          |          |
 *  21---------22---------23
 */

export type Position = number;
export type Player = 'white' | 'black' | null;

export interface BoardState {
  [key: number]: Player;
}

// Adjacency list representing the graph structure of the board
export const adjacencyList: Record<Position, Position[]> = {
  0: [1, 9],
  1: [0, 2, 4],
  2: [1, 14],
  3: [4, 10],
  4: [1, 3, 5, 7],
  5: [4, 13],
  6: [7, 11],
  7: [4, 6, 8],
  8: [7, 12],
  9: [0, 10, 21],
  10: [3, 9, 11, 18],
  11: [6, 10, 15],
  12: [8, 13, 17],
  13: [5, 12, 14, 20],
  14: [2, 13, 23],
  15: [11, 16],
  16: [15, 17, 19],
  17: [12, 16],
  18: [10, 19],
  19: [16, 18, 20, 22],
  20: [13, 19],
  21: [9, 22],
  22: [19, 21, 23],
  23: [14, 22],
};

// All possible mill combinations (16 mills total)
export const millCombinations: Position[][] = [
  // Outer square
  [0, 1, 2],    // Top horizontal
  [2, 14, 23],  // Right vertical
  [21, 22, 23], // Bottom horizontal
  [0, 9, 21],   // Left vertical
  
  // Middle square
  [3, 4, 5],    // Top horizontal
  [5, 13, 20],  // Right vertical
  [18, 19, 20], // Bottom horizontal
  [3, 10, 18],  // Left vertical
  
  // Inner square
  [6, 7, 8],    // Top horizontal
  [8, 12, 17],  // Right vertical
  [15, 16, 17], // Bottom horizontal
  [6, 11, 15],  // Left vertical
  
  // Middle connections
  [1, 4, 7],    // Top vertical
  [16, 19, 22], // Bottom vertical
  [9, 10, 11],  // Left horizontal
  [12, 13, 14], // Right horizontal
];

// Position coordinates for rendering (SVG viewBox: 0 0 600 600)
export const positionCoordinates: Record<Position, { x: number; y: number }> = {
  // Outer square - normalized to 0-1 range
  0: { x: 0, y: 0 },
  1: { x: 0.5, y: 0 },
  2: { x: 1, y: 0 },
  
  // Middle square top
  3: { x: 0.2, y: 0.2 },
  4: { x: 0.5, y: 0.2 },
  5: { x: 0.8, y: 0.2 },
  
  // Inner square top
  6: { x: 0.4, y: 0.4 },
  7: { x: 0.5, y: 0.4 },
  8: { x: 0.6, y: 0.4 },
  
  // Left middle
  9: { x: 0, y: 0.5 },
  10: { x: 0.2, y: 0.5 },
  11: { x: 0.4, y: 0.5 },
  
  // Right middle
  12: { x: 0.6, y: 0.5 },
  13: { x: 0.8, y: 0.5 },
  14: { x: 1, y: 0.5 },
  
  // Inner square bottom
  15: { x: 0.4, y: 0.6 },
  16: { x: 0.5, y: 0.6 },
  17: { x: 0.6, y: 0.6 },
  
  // Middle square bottom
  18: { x: 0.2, y: 0.8 },
  19: { x: 0.5, y: 0.8 },
  20: { x: 0.8, y: 0.8 },
  
  // Outer square bottom
  21: { x: 0, y: 1 },
  22: { x: 0.5, y: 1 },
  23: { x: 1, y: 1 },
};

// Lines to draw on the board
export const boardLines: Array<[Position, Position]> = [
  // Outer square
  [0, 1], [1, 2], [2, 14], [14, 23], [23, 22], [22, 21], [21, 9], [9, 0],
  
  // Middle square
  [3, 4], [4, 5], [5, 13], [13, 20], [20, 19], [19, 18], [18, 10], [10, 3],
  
  // Inner square
  [6, 7], [7, 8], [8, 12], [12, 17], [17, 16], [16, 15], [15, 11], [11, 6],
  
  // Connecting lines
  [1, 4], [4, 7], [16, 19], [19, 22], [9, 10], [10, 11], [12, 13], [13, 14],
];

export const TOTAL_POSITIONS = 24;
export const PIECES_PER_PLAYER = 9;
