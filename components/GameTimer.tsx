'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

interface GameTimerProps {
  isRunning: boolean;
  onTimeUpdate?: (seconds: number) => void;
  resetTrigger?: number; // Add reset trigger
}

const GameTimer: React.FC<GameTimerProps> = ({ isRunning, onTimeUpdate, resetTrigger = 0 }) => {
  const [seconds, setSeconds] = useState(0);
  const { settings } = useTheme();
  const theme = settings.theme;

  // Reset timer when resetTrigger changes
  useEffect(() => {
    setSeconds(0);
  }, [resetTrigger]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const newTime = prev + 1;
          onTimeUpdate?.(newTime);
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, onTimeUpdate]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className="flex items-center gap-3 px-6 py-3 rounded-xl"
      style={{
        backgroundColor: theme.cardBg,
        border: `2px solid ${theme.buttonPrimary}`,
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Timer Icon */}
      <motion.div
        animate={{
          rotate: isRunning ? 360 : 0,
        }}
        transition={{
          duration: 2,
          repeat: isRunning ? Infinity : 0,
          ease: 'linear',
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke={theme.buttonPrimary}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </motion.div>

      {/* Timer Display */}
      <div className="flex flex-col">
        <span
          className="text-xs font-medium opacity-70"
          style={{ color: theme.textSecondary }}
        >
          Game Time
        </span>
        <motion.span
          className="text-xl font-bold font-mono tracking-wider"
          style={{ color: theme.buttonPrimary }}
          key={seconds}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {formatTime(seconds)}
        </motion.span>
      </div>

      {/* Status Indicator */}
      <motion.div
        className="w-3 h-3 rounded-full"
        style={{
          backgroundColor: isRunning ? theme.buttonPrimary : theme.textSecondary,
        }}
        animate={{
          scale: isRunning ? [1, 1.2, 1] : 1,
          opacity: isRunning ? [1, 0.6, 1] : 0.3,
        }}
        transition={{
          duration: 1.5,
          repeat: isRunning ? Infinity : 0,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
};

export default GameTimer;
