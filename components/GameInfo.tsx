'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GameState } from '@/lib/gameLogic';

interface GameInfoProps {
  gameState: GameState;
  onReset: () => void;
}

export default function GameInfo({ gameState, onReset }: GameInfoProps) {
  const { currentPlayer, phase, piecesRemaining, piecesOnBoard, message, winner } = gameState;

  const getPhaseDisplay = () => {
    switch (phase) {
      case 'placing':
        return '📍 Placing Phase';
      case 'moving':
        return '➡️ Moving Phase';
      case 'flying':
        return '✈️ Flying Phase';
      case 'removing':
        return '❌ Remove Opponent Piece';
      case 'gameOver':
        return '🏆 Game Over';
      default:
        return '';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Current Turn Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`rounded-lg p-6 text-center shadow-lg border-4 transition-all ${
        currentPlayer === 'white'
          ? 'bg-gray-100 border-gray-800'
          : 'bg-gray-800 border-gray-100 text-white'
      }`}>
        <div className="text-sm font-semibold uppercase tracking-wide mb-2">
          {getPhaseDisplay()}
        </div>
        <div className="text-2xl font-bold mb-2">
          {message}
        </div>
        {winner && (
          <div className="text-xl mt-2 animate-bounce">
            🎉 {winner.toUpperCase()} WINS! 🎉
          </div>
        )}
      </motion.div>

      {/* Game Stats */}
      <div className="grid grid-cols-2 gap-4">
        {/* White Player Stats */}
        <div className="bg-gray-100 rounded-lg p-4 border-4 border-gray-800 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xl font-bold text-gray-800">⚪ White</div>
            {currentPlayer === 'white' && phase !== 'gameOver' && (
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            )}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">To Place:</span>
              <span className="font-bold text-gray-800">
                {piecesRemaining.white}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">On Board:</span>
              <span className="font-bold text-gray-800">
                {piecesOnBoard.white}
              </span>
            </div>
          </div>
        </div>

        {/* Black Player Stats */}
        <div className="bg-gray-800 rounded-lg p-4 border-4 border-gray-800 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xl font-bold text-gray-100">⚫ Black</div>
            {currentPlayer === 'black' && phase !== 'gameOver' && (
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            )}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">To Place:</span>
              <span className="font-bold text-gray-100">
                {piecesRemaining.black}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">On Board:</span>
              <span className="font-bold text-gray-100">
                {piecesOnBoard.black}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="text-center">
        <button
          onClick={onReset}
          className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105 active:scale-95"
        >
          🔄 New Game
        </button>
      </div>

      {/* Rules Hint */}
      <div className="bg-amber-50 border-2 border-amber-600 rounded-lg p-4 text-sm text-amber-900">
        <div className="font-bold mb-2">📖 Quick Rules:</div>
        <ul className="space-y-1 list-disc list-inside">
          <li><strong>Placing:</strong> Take turns placing 9 pieces each</li>
          <li><strong>Mill:</strong> Form 3 in a row to remove opponent's piece</li>
          <li><strong>Moving:</strong> Move to adjacent positions after placing</li>
          <li><strong>Flying:</strong> Jump anywhere when you have 3 pieces</li>
          <li><strong>Win:</strong> Reduce opponent to 2 pieces or block all moves</li>
        </ul>
      </div>
    </div>
  );
}
