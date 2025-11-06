'use client';

import { motion } from 'framer-motion';
import { Position, Player, positionCoordinates, boardLines } from '@/lib/boardConfig';
import { canRemovePiece, getOpponent } from '@/lib/gameLogic';
import { Theme, PieceStyle } from '@/contexts/ThemeContext';
import Piece from './Piece';

interface EnhancedBoardProps {
  board: Record<Position, Player | null>;
  selectedPosition: Position | null;
  legalMoves: Position[];
  lastMovedPosition?: Position | null;
  onPositionClick: (position: Position) => void;
  phase: string;
  currentPlayer: Player | null;
  theme: Theme;
  pieceStyle: PieceStyle;
  animationsEnabled: boolean;
}

export default function EnhancedBoard({
  board,
  selectedPosition,
  legalMoves,
  lastMovedPosition = null,
  onPositionClick,
  phase,
  currentPlayer = null,
  theme,
  pieceStyle,
  animationsEnabled,
}: EnhancedBoardProps) {
  const size = 800;
  const padding = 50;
  const innerSize = size - 2 * padding;

  // Debug logging
  console.log('Board rendering:', {
    boardLinesCount: boardLines.length,
    positionsCount: Object.keys(positionCoordinates).length,
    theme: theme.boardLines,
    board: Object.keys(board).length
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex justify-center w-full"
      style={{ minHeight: '500px' }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rounded-2xl shadow-2xl"
        style={{
          backgroundColor: theme.boardBg,
          border: `4px solid ${theme.boardLines}`,
          maxWidth: '100%',
          height: 'auto',
        }}
      >
        {/* Board Lines */}
        {boardLines.map((line, index) => {
          const [from, to] = line;
          const fromCoords = positionCoordinates[from as Position];
          const toCoords = positionCoordinates[to as Position];
          
          if (!fromCoords || !toCoords) {
            console.error('Missing coordinates for line:', from, to);
            return null;
          }
          
          const x1 = padding + fromCoords.x * innerSize;
          const y1 = padding + fromCoords.y * innerSize;
          const x2 = padding + toCoords.x * innerSize;
          const y2 = padding + toCoords.y * innerSize;
          
          return (
            <line
              key={`line-${index}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={theme.boardLines || '#000'}
              strokeWidth="4"
              strokeLinecap="round"
            />
          );
        })}

        {/* Position Points and Pieces */}
        {Object.entries(positionCoordinates).map(([pos, coords]) => {
          const position = parseInt(pos) as Position;
          const x = padding + coords.x * innerSize;
          const y = padding + coords.y * innerSize;
          const piece = board[position];
          const isSelected = selectedPosition === position;
          const isLegalMove = legalMoves.includes(position);
          // Only opponent pieces should be highlighted for removal.
          // Use game logic to determine if the piece is removable (not part of a mill unless all are in mills).
          const opponent = currentPlayer ? getOpponent(currentPlayer) : null;
          const isRemovable =
            phase === 'removing' &&
            piece !== null &&
            opponent !== null &&
            piece === opponent &&
            canRemovePiece(board as any, position as Position, opponent);
          const isLastMoved = lastMovedPosition === position;

          return (
            <g key={position}>
              {/* Last Moved Piece Highlight */}
              {isLastMoved && piece && (
                <motion.circle
                  cx={x}
                  cy={y}
                  r={35}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="4"
                  opacity={0.8}
                  animate={{
                    r: [30, 38, 30],
                    opacity: [0.8, 0.4, 0.8],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}

              {/* Legal Move Indicators - Each with unique color and animation */}
              {isLegalMove && !piece && (() => {
                const moveIndex = legalMoves.indexOf(position);
                const colors = [
                  '#10b981', // green
                  '#3b82f6', // blue
                  '#8b5cf6', // purple
                  '#f59e0b', // amber
                  '#ec4899', // pink
                  '#06b6d4', // cyan
                  '#f97316', // orange
                  '#84cc16', // lime
                ];
                const color = colors[moveIndex % colors.length];
                const duration = 0.8 + (moveIndex * 0.15);
                
                return (
                  <>
                    {/* Outer pulsing ring */}
                    <motion.circle
                      cx={x}
                      cy={y}
                      r={18}
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                      opacity={0.4}
                      animate={animationsEnabled ? {
                        r: [16, 22, 16],
                        opacity: [0.6, 0.2, 0.6],
                      } : {}}
                      transition={{
                        duration: duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    {/* Inner glowing dot */}
                    <motion.circle
                      cx={x}
                      cy={y}
                      r={10}
                      fill={color}
                      opacity={0.6}
                      animate={animationsEnabled ? {
                        scale: [1, 1.3, 1],
                        opacity: [0.6, 0.9, 0.6],
                      } : {}}
                      transition={{
                        duration: duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </>
                );
              })()}

              {/* Removable Piece Indicator - Black highlighting */}
              {isRemovable && (
                <>
                  <motion.circle
                    cx={x}
                    cy={y}
                    r={40}
                    fill="rgba(0, 0, 0, 0.3)"
                    stroke="#000000"
                    strokeWidth="4"
                    opacity={0.8}
                    animate={{
                      r: [35, 42, 35],
                      opacity: [0.8, 0.5, 0.8],
                    }}
                    transition={{
                      duration: 0.7,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.circle
                    cx={x}
                    cy={y}
                    r={28}
                    fill="none"
                    stroke="#1f2937"
                    strokeWidth="3"
                    opacity={0.9}
                    animate={{
                      r: [25, 30, 25],
                      opacity: [0.9, 0.6, 0.9],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </>
              )}

              {/* Selected Position Highlight */}
              {isSelected && (
                <motion.circle
                  cx={x}
                  cy={y}
                  r={20}
                  fill="none"
                  stroke={theme.highlightSelected}
                  strokeWidth="3"
                  animate={animationsEnabled ? {
                    r: [18, 22, 18],
                  } : {}}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}

              {/* Position Point */}
              <circle
                cx={x}
                cy={y}
                r={10}
                fill={theme.boardPoints || '#654321'}
                stroke={theme.boardLines || '#000'}
                strokeWidth="3"
              />

              {/* Piece */}
              {piece && (
                <motion.g
                  initial={animationsEnabled ? { scale: 0, opacity: 0 } : {}}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={animationsEnabled ? { scale: 0, opacity: 0 } : {}}
                  transition={{ duration: 0.3 }}
                  whileHover={animationsEnabled ? { scale: 1.1 } : {}}
                >
                  <g>
                    <Piece
                      x={x}
                      y={y}
                      color={piece === 'white' ? theme.whitePiece : theme.blackPiece}
                      style={pieceStyle}
                      size={18}
                    />
                    {/* Add visible stroke for black pieces with auto-hide */}
                    {piece === 'black' && (
                      <motion.circle
                        cx={x}
                        cy={y}
                        r={30}
                        fill="none"
                        stroke="#666666"
                        strokeWidth="3"
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: 0 }}
                        transition={{ 
                          duration: 0.5,
                          delay: 2.5,
                          ease: "easeOut"
                        }}
                      />
                    )}
                  </g>
                </motion.g>
              )}

              {/* Clickable Area */}
              <circle
                cx={x}
                cy={y}
                r={25}
                fill="transparent"
                cursor="pointer"
                onClick={() => onPositionClick(position)}
                onMouseEnter={(e) => {
                  (e.target as SVGCircleElement).style.fill = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  (e.target as SVGCircleElement).style.fill = 'transparent';
                }}
              />
            </g>
          );
        })}

        {/* Position Labels (for debugging - can be removed) */}
        {process.env.NODE_ENV === 'development' && (
          <>
            {Object.entries(positionCoordinates).map(([pos, coords]) => {
              const position = parseInt(pos) as Position;
              const x = padding + coords.x * innerSize;
              const y = padding + coords.y * innerSize;
              return (
                <text
                  key={`label-${position}`}
                  x={x}
                  y={y - 30}
                  textAnchor="middle"
                  fill={theme.textSecondary}
                  fontSize="12"
                  opacity="0.5"
                >
                  {position}
                </text>
              );
            })}
          </>
        )}
      </svg>
    </motion.div>
  );
}
