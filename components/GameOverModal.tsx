'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { Theme } from '@/contexts/ThemeContext';

type Player = 'white' | 'black' | null;

interface GameOverModalProps {
  winner: Player;
  aiMode: boolean;
  humanPlayer?: Player | null;
  isPlayerWin?: boolean;
  moves?: number;
  isPerfect?: boolean;
  totalTimeSeconds?: number;
  onPlayAgain: () => void;
  onBack: () => void;
  theme: Theme;
}

export default function GameOverModal({
  winner,
  aiMode,
  humanPlayer = null,
  isPlayerWin = false,
  moves = 0,
  isPerfect = false,
  totalTimeSeconds = 0,
  onPlayAgain,
  onBack,
  theme,
}: GameOverModalProps) {
  const title = aiMode
    ? isPlayerWin
      ? 'You Win!'
      : 'You Lost'
    : winner
    ? `${winner.toUpperCase()} Wins!`
    : 'Game Over';

  const subtitle = aiMode
    ? isPlayerWin
      ? isPerfect
        ? 'Perfect victory — none lost!'
        : 'Well played — opponent defeated.'
      : 'Better luck next time.'
    : `Congratulations to ${winner?.toUpperCase()}!`;

  return (
    <AnimatePresence>
      <motion.div
        key="game-over-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Card */}
        <motion.div
          className="relative z-10 w-[min(720px,95%)] mx-auto rounded-2xl shadow-2xl p-8"
          style={{ background: theme.cardBg, border: `2px solid ${theme.cardBorder}` }}
          initial={{ y: 20, scale: 0.98, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 20, scale: 0.98, opacity: 0 }}
        >
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="flex-1 text-center lg:text-left">
              <div className="text-6xl font-extrabold mb-2" style={{ color: theme.textPrimary }}>
                {title}
              </div>
              <div className="text-lg mb-4" style={{ color: theme.textSecondary }}>
                {subtitle}
              </div>

              <div className="mt-4 p-4 rounded-lg" style={{ background: `${theme.buttonPrimary}10`, color: theme.textPrimary }}>
                <div className="text-sm">Moves made</div>
                <div className="text-2xl font-bold">{moves}</div>
              </div>

              {/* Total time */}
              <div className="mt-3 p-3 rounded-lg" style={{ background: `${theme.cardBg}`, color: theme.textPrimary }}>
                <div className="text-sm">Total time</div>
                <div className="text-xl font-bold">
                  {(() => {
                    const mins = Math.floor((totalTimeSeconds || 0) / 60);
                    const secs = (totalTimeSeconds || 0) % 60;
                    return `${mins}:${secs.toString().padStart(2, '0')}`;
                  })()}
                </div>
              </div>

              {/* Optional small note for AI games (no duplicate message) */}
              {aiMode && !isPlayerWin && (
                <div className="mt-4 text-sm" style={{ color: theme.textSecondary }}>
                  <span>Try a different strategy or difficulty.</span>
                </div>
              )}

              <div className="mt-6 flex gap-3 justify-center lg:justify-start">
                <button
                  onClick={onPlayAgain}
                  className="px-6 py-3 rounded-lg font-semibold"
                  style={{ background: theme.buttonPrimary, color: '#fff' }}
                >
                  ▶ Play Again
                </button>

                <button
                  onClick={onBack}
                  className="px-6 py-3 rounded-lg font-semibold flex items-center"
                  style={{ background: theme.cardBorder, color: theme.textPrimary }}
                >
                  <span style={{ fontSize: 22, fontWeight: 700, marginRight: 10 }}>←</span>
                  Back to Menu
                </button>
              </div>
            </div>

            <div className="w-40 h-40 flex items-center justify-center rounded-full shadow-inner" style={{ background: theme.boardBg }}>
              <div className="text-center">
                <div style={{ color: winner === 'white' ? theme.whitePiece : theme.blackPiece }} className="text-5xl font-black">
                  {winner === 'white' ? '⚪' : '⚫'}
                </div>
                <div style={{ color: theme.textSecondary }} className="text-xs mt-2">Winner</div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
