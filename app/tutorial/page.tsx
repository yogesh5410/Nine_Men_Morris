'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

const tutorialSteps = [
  {
    title: 'Welcome to Nine Men\'s Morris',
    content: 'Nine Men\'s Morris is an ancient strategy board game dating back to the Roman Empire. Two players compete to form "mills" (three pieces in a row) while trying to reduce their opponent to just two pieces.',
    icon: '🎯',
  },
  {
    title: 'The Board',
    content: 'The game is played on a board with 24 positions arranged in three concentric squares. Pieces can be placed on any of the 24 intersection points, and they move along the lines connecting the positions.',
    icon: '🎲',
  },
  {
    title: 'Phase 1: Placing',
    content: 'Each player starts with 9 pieces. Players take turns placing one piece at a time on any empty position. This continues until all 18 pieces (9 per player) are on the board.',
    icon: '📍',
  },
  {
    title: 'Forming Mills',
    content: 'A mill is formed when you get three of your pieces in a row (horizontally or vertically). When you form a mill, you may remove one of your opponent\'s pieces from the board!',
    icon: '⭐',
  },
  {
    title: 'Removing Pieces',
    content: 'When you form a mill, you can remove any opponent piece that is NOT part of a mill. If all opponent pieces are in mills, you can remove any piece. Removed pieces are out of the game permanently.',
    icon: '❌',
  },
  {
    title: 'Phase 2: Moving',
    content: 'After all pieces are placed, players move one piece per turn to an adjacent empty position (along the board lines). Continue forming mills to remove opponent pieces!',
    icon: '↔️',
  },
  {
    title: 'Phase 3: Flying',
    content: 'When a player is reduced to only 3 pieces, they can "fly" - meaning they can move to ANY empty position on the board, not just adjacent ones. This gives them more mobility!',
    icon: '✈️',
  },
  {
    title: 'Winning the Game',
    content: 'You win by reducing your opponent to just 2 pieces (they can\'t form mills anymore) OR by blocking all their moves so they have no legal moves available.',
    icon: '🏆',
  },
  {
    title: 'Game Features',
    content: 'This version includes:\n• AI opponent with 3 difficulty levels\n• Undo/Redo moves\n• 3 hints per game\n• Multiple themes and piece styles\n• Statistics and achievements\n• Player vs Player mode',
    icon: '🎮',
  },
  {
    title: 'Ready to Play?',
    content: 'You\'re now ready to start playing! Remember:\n• Form mills to remove opponent pieces\n• Protect your own pieces from being removed\n• Plan ahead and think strategically\n• Have fun!',
    icon: '🚀',
  },
];

export default function TutorialPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const { settings } = useTheme();

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: settings.theme.background }}
    >
      <div className="max-w-3xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1
            className="text-5xl font-bold mb-4"
            style={{ color: settings.theme.textPrimary }}
          >
            📚 Tutorial
          </h1>
          
          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full overflow-hidden mb-2" style={{ backgroundColor: `${settings.theme.cardBorder}40` }}>
            <motion.div
              className="h-full"
              style={{ backgroundColor: settings.theme.buttonPrimary }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p style={{ color: settings.theme.textSecondary }}>
            Step {currentStep + 1} of {tutorialSteps.length}
          </p>
        </motion.div>

        {/* Content Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="p-8 rounded-2xl border-2 mb-8"
            style={{
              backgroundColor: settings.theme.cardBg,
              borderColor: settings.theme.cardBorder,
            }}
          >
            <div className="text-7xl text-center mb-6">{step.icon}</div>
            
            <h2
              className="text-3xl font-bold mb-4 text-center"
              style={{ color: settings.theme.textPrimary }}
            >
              {step.title}
            </h2>
            
            <p
              className="text-lg leading-relaxed whitespace-pre-line"
              style={{ color: settings.theme.textSecondary }}
            >
              {step.content}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center gap-4">
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-lg font-semibold"
              style={{
                backgroundColor: settings.theme.cardBg,
                borderColor: settings.theme.cardBorder,
                color: settings.theme.textPrimary,
                border: `2px solid ${settings.theme.cardBorder}`,
              }}
            >
              ← Home
            </motion.button>
          </Link>

          <div className="flex gap-4">
            {currentStep > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={prevStep}
                className="px-6 py-3 rounded-lg font-semibold"
                style={{
                  backgroundColor: settings.theme.cardBg,
                  borderColor: settings.theme.cardBorder,
                  color: settings.theme.textPrimary,
                  border: `2px solid ${settings.theme.cardBorder}`,
                }}
              >
                Previous
              </motion.button>
            )}

            {currentStep < tutorialSteps.length - 1 ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextStep}
                className="px-6 py-3 rounded-lg font-semibold text-white"
                style={{
                  backgroundColor: settings.theme.buttonPrimary,
                }}
              >
                Next →
              </motion.button>
            ) : (
              <Link href="/mode-select">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-lg font-semibold text-white"
                  style={{
                    backgroundColor: settings.theme.buttonPrimary,
                  }}
                >
                  Start Playing! 🎮
                </motion.button>
              </Link>
            )}
          </div>
        </div>

        {/* Quick Skip */}
        {currentStep < tutorialSteps.length - 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center mt-6"
          >
            <Link href="/mode-select">
              <button
                className="text-sm underline"
                style={{ color: settings.theme.textSecondary }}
              >
                Skip tutorial and start playing
              </button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
