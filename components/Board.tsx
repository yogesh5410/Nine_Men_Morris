'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Position,
  Player,
  positionCoordinates,
  boardLines,
} from '@/lib/boardConfig';

interface BoardProps {
  board: Record<Position, Player>;
  selectedPosition: Position | null;
  legalMoves: Position[];
  onPositionClick: (position: Position) => void;
  phase: string;
}

export default function Board({
  board,
  selectedPosition,
  legalMoves,
  onPositionClick,
  phase,
}: BoardProps) {
  const SVG_SIZE = 600;
  const POINT_RADIUS = 12;
  const PIECE_RADIUS = 18;

  return (
    <div className="flex justify-center items-center">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        className="max-w-2xl w-full bg-amber-50 rounded-lg shadow-2xl border-4 border-amber-800"
      >
        {/* Draw board lines */}
        <g className="board-lines">
          {boardLines.map(([pos1, pos2], index) => {
            const coord1 = positionCoordinates[pos1];
            const coord2 = positionCoordinates[pos2];
            return (
              <line
                key={`line-${index}`}
                x1={coord1.x}
                y1={coord1.y}
                x2={coord2.x}
                y2={coord2.y}
                stroke="#78350f"
                strokeWidth="3"
                strokeLinecap="round"
              />
            );
          })}
        </g>

        {/* Draw position points and pieces */}
        <g className="positions">
          {Object.keys(positionCoordinates).map((posKey) => {
            const position = Number(posKey) as Position;
            const coord = positionCoordinates[position];
            const piece = board[position];
            const isSelected = selectedPosition === position;
            const isLegalMove = legalMoves.includes(position);
            const isEmpty = piece === null;

            return (
              <g key={`pos-${position}`}>
                {/* Position point (always visible) */}
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r={POINT_RADIUS}
                  fill={isLegalMove ? '#10b981' : '#d97706'}
                  stroke="#78350f"
                  strokeWidth="2"
                  className={`cursor-pointer transition-all ${
                    isLegalMove ? 'animate-pulse' : ''
                  }`}
                  onClick={() => onPositionClick(position)}
                />

                {/* Piece (if present) */}
                {piece && (
                  <g className="piece-group">
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r={PIECE_RADIUS}
                      fill={piece === 'white' ? '#f9fafb' : '#1f2937'}
                      stroke={isSelected ? '#3b82f6' : '#78350f'}
                      strokeWidth={isSelected ? '4' : '3'}
                      className={`cursor-pointer transition-all duration-300 ${
                        isSelected ? 'drop-shadow-xl' : 'drop-shadow-lg'
                      } hover:drop-shadow-2xl hover:scale-110`}
                      onClick={() => onPositionClick(position)}
                      style={{
                        transformOrigin: `${coord.x}px ${coord.y}px`,
                        animation: isSelected ? 'pulse 1s infinite' : 'none',
                      }}
                    />
                    {/* Inner highlight for white pieces */}
                    {piece === 'white' && (
                      <circle
                        cx={coord.x - 5}
                        cy={coord.y - 5}
                        r={5}
                        fill="rgba(255, 255, 255, 0.6)"
                        pointerEvents="none"
                      />
                    )}
                    {/* Glow effect for selected piece */}
                    {isSelected && (
                      <circle
                        cx={coord.x}
                        cy={coord.y}
                        r={PIECE_RADIUS + 8}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        opacity="0.5"
                        className="animate-ping"
                      />
                    )}
                  </g>
                )}

                {/* Highlight for legal moves on empty positions */}
                {isEmpty && isLegalMove && (
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r={PIECE_RADIUS - 4}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeDasharray="5,5"
                    className="animate-pulse"
                    pointerEvents="none"
                  />
                )}
              </g>
            );
          })}
        </g>

        {/* Position labels for debugging (optional - can be removed) */}
        {process.env.NODE_ENV === 'development' && (
          <g className="position-labels" opacity="0.3">
            {Object.keys(positionCoordinates).map((posKey) => {
              const position = Number(posKey) as Position;
              const coord = positionCoordinates[position];
              return (
                <text
                  key={`label-${position}`}
                  x={coord.x}
                  y={coord.y - 25}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#78350f"
                  pointerEvents="none"
                >
                  {position}
                </text>
              );
            })}
          </g>
        )}
      </svg>
    </div>
  );
}
