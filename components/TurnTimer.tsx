'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TurnTimerProps {
  currentPlayer: 'white' | 'black' | null;
  isRunning: boolean;
  onTimeout: () => void;
  maxTime?: number; // seconds
  theme: any;
  resetTrigger?: number; // Add reset trigger
}

const TurnTimer: React.FC<TurnTimerProps> = ({
  currentPlayer,
  isRunning,
  onTimeout,
  maxTime = 30,
  theme,
  resetTrigger = 0,
}) => {
  const [timeLeft, setTimeLeft] = useState(maxTime);

  // Reset timer when player changes or reset trigger changes
  useEffect(() => {
    setTimeLeft(maxTime);
  }, [currentPlayer, maxTime, resetTrigger]);

  // Countdown logic
  useEffect(() => {
    if (!isRunning || !currentPlayer) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Call timeout in next tick to avoid setState during render
          setTimeout(() => onTimeout(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, currentPlayer, onTimeout]);

  const percentage = (timeLeft / maxTime) * 100;
  const isLow = timeLeft <= 10;
  const isCritical = timeLeft <= 5;

  if (!currentPlayer) return null;

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-sm font-semibold"
          style={{ color: theme.textPrimary }}
        >
          Turn Timer
        </span>
        <motion.span
          className="text-2xl font-bold font-mono"
          style={{
            color: isCritical
              ? '#ef4444'
              : isLow
              ? '#f59e0b'
              : theme.textPrimary,
          }}
          animate={isCritical ? { scale: [1, 1.1, 1] } : {}}
          transition={{
            duration: 0.5,
            repeat: isCritical ? Infinity : 0,
          }}
        >
          {timeLeft}s
        </motion.span>
      </div>

      {/* Progress Bar */}
      <div
        className="w-full h-3 rounded-full overflow-hidden"
        style={{
          backgroundColor: `${theme.cardBorder}40`,
        }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            backgroundColor: isCritical
              ? '#ef4444'
              : isLow
              ? '#f59e0b'
              : theme.buttonPrimary,
          }}
          initial={{ width: '100%' }}
          animate={{
            width: `${percentage}%`,
          }}
          transition={{
            duration: 0.3,
            ease: 'linear',
          }}
        />
      </div>

      {/* Warning Messages */}
      {isLow && (
        <motion.p
          className="text-xs text-center mt-2 font-semibold"
          style={{
            color: isCritical ? '#ef4444' : '#f59e0b',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {isCritical ? '⚠️ Time running out!' : '⏰ Hurry up!'}
        </motion.p>
      )}
    </motion.div>
  );
};

export default TurnTimer;
