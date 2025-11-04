'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useStats } from '@/contexts/StatsContext';

interface GameMode {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty?: string;
  features: string[];
}

const gameModes: GameMode[] = [
  {
    id: 'pvp',
    title: 'Player vs Player',
    description: 'Play against a friend on the same device',
    icon: '👥',
    features: ['Hot seat gameplay', '3 hints each', 'Undo/Redo', 'All themes & pieces'],
  },
  {
    id: 'ai-easy',
    title: 'AI - Easy',
    description: 'Perfect for beginners learning the game',
    icon: '🤖',
    difficulty: 'Easy',
    features: ['2-ply search', 'Makes mistakes', '3 hints', 'Great for learning'],
  },
  {
    id: 'ai-medium',
    title: 'AI - Medium',
    description: 'Good challenge for intermediate players',
    icon: '🎯',
    difficulty: 'Medium',
    features: ['4-ply search', 'Strategic play', '3 hints', 'Balanced opponent'],
  },
  {
    id: 'ai-hard',
    title: 'AI - Hard',
    description: 'Ultimate challenge for expert players',
    icon: '🏆',
    difficulty: 'Hard',
    features: ['6-ply search', 'Alpha-Beta pruning', '3 hints', 'Nearly unbeatable'],
  },
];

export default function ModeSelectPage() {
  const router = useRouter();
  const { settings } = useTheme();
  const { startSession } = useStats();

  const handleModeSelect = (modeId: string) => {
    // Start session tracking
    startSession(modeId as any);
    
    // Navigate to game with mode parameter
    router.push(`/game?mode=${modeId}`);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: settings.theme.background }}
    >
      <div className="max-w-6xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1
            className="text-5xl font-bold mb-4"
            style={{ color: settings.theme.textPrimary }}
          >
            🎮 Select Game Mode
          </h1>
          <p
            className="text-xl"
            style={{ color: settings.theme.textSecondary }}
          >
            Choose how you want to play
          </p>
        </motion.div>

        {/* Mode Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {gameModes.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="cursor-pointer"
              onClick={() => handleModeSelect(mode.id)}
            >
              <div
                className="p-8 rounded-2xl border-2 h-full"
                style={{
                  backgroundColor: settings.theme.cardBg,
                  borderColor: settings.theme.cardBorder,
                }}
              >
                {/* Icon and Difficulty Badge */}
                <div className="flex justify-between items-start mb-4">
                  <div className="text-6xl">{mode.icon}</div>
                  {mode.difficulty && (
                    <div
                      className="px-3 py-1 rounded-full text-sm font-semibold"
                      style={{
                        backgroundColor: `${settings.theme.buttonPrimary}20`,
                        color: settings.theme.buttonPrimary,
                      }}
                    >
                      {mode.difficulty}
                    </div>
                  )}
                </div>

                {/* Title and Description */}
                <h3
                  className="text-2xl font-bold mb-2"
                  style={{ color: settings.theme.textPrimary }}
                >
                  {mode.title}
                </h3>
                <p
                  className="mb-4"
                  style={{ color: settings.theme.textSecondary }}
                >
                  {mode.description}
                </p>

                {/* Features List */}
                <div className="space-y-2">
                  {mode.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: settings.theme.textSecondary }}
                    >
                      <span className="text-green-500">✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Play Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full mt-6 px-6 py-3 rounded-lg font-semibold text-white"
                  style={{
                    backgroundColor: settings.theme.buttonPrimary,
                  }}
                >
                  Play Now →
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Back Button */}
        <div className="flex justify-center gap-4">
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-lg font-semibold"
              style={{
                backgroundColor: settings.theme.cardBg,
                borderColor: settings.theme.cardBorder,
                color: settings.theme.textPrimary,
                border: `2px solid ${settings.theme.cardBorder}`,
              }}
            >
              ← Back to Home
            </motion.button>
          </Link>

          <Link href="/settings">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-lg font-semibold"
              style={{
                backgroundColor: settings.theme.cardBg,
                borderColor: settings.theme.cardBorder,
                color: settings.theme.textPrimary,
                border: `2px solid ${settings.theme.cardBorder}`,
              }}
            >
              ⚙️ Settings
            </motion.button>
          </Link>
        </div>

        {/* Info Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8"
          style={{ color: settings.theme.textSecondary }}
        >
          <p className="text-sm">
            💡 Tip: You can change themes and piece styles in settings anytime during the game
          </p>
        </motion.div>
      </div>
    </div>
  );
}
