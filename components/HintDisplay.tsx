'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

interface HintDisplayProps {
  hint: string | null;
  onClose: () => void;
}

const HintDisplay: React.FC<HintDisplayProps> = ({ hint, onClose }) => {
  const { settings } = useTheme();
  const theme = settings.theme;

  return (
    <AnimatePresence>
      {hint && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Hint Modal */}
          <motion.div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4"
            style={{
              backgroundColor: theme.cardBg,
              border: `3px solid ${theme.buttonPrimary}`,
            }}
            initial={{ scale: 0.5, opacity: 0, y: -50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {/* Lightbulb Icon */}
                <motion.div
                  animate={{
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: 2,
                  }}
                >
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill={theme.buttonPrimary}
                    stroke={theme.buttonPrimary}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 18h6" />
                    <path d="M10 22h4" />
                    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
                  </svg>
                </motion.div>

                <h2
                  className="text-2xl font-bold"
                  style={{ color: theme.textPrimary }}
                >
                  Hint
                </h2>
              </div>

              {/* Close Button */}
              <motion.button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-opacity-80 transition-colors"
                style={{ backgroundColor: theme.buttonPrimary }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={theme.textPrimary}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </motion.button>
            </div>

            {/* Hint Content */}
            <motion.div
              className="p-6 rounded-xl"
              style={{
                backgroundColor: theme.background,
                border: `2px solid ${theme.cardBorder}`,
              }}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p
                className="text-lg leading-relaxed"
                style={{ color: theme.textPrimary }}
              >
                {hint}
              </p>
            </motion.div>

            {/* Footer Tip */}
            <motion.p
              className="mt-6 text-sm text-center"
              style={{ color: theme.textSecondary }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              💡 Use hints wisely - you have limited hints per game!
            </motion.p>

            {/* Action Button */}
            <motion.button
              onClick={onClose}
              className="mt-6 w-full py-3 px-6 rounded-xl font-semibold text-lg transition-all"
              style={{
                backgroundColor: theme.buttonPrimary,
                color: theme.textPrimary,
              }}
              whileHover={{
                scale: 1.02,
                backgroundColor: theme.buttonHover,
              }}
              whileTap={{ scale: 0.98 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Got it!
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default HintDisplay;
