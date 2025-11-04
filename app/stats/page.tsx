'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { useStats } from '@/contexts/StatsContext';

const achievements = [
  { id: 'first-win', name: 'First Victory', description: 'Win your first game', icon: '🎉' },
  { id: 'veteran', name: 'Veteran', description: 'Win 10 games', icon: '⭐' },
  { id: 'master', name: 'Master', description: 'Win 50 games', icon: '👑' },
  { id: 'perfect', name: 'Perfect Game', description: 'Win without losing a piece', icon: '💎' },
  { id: 'streak-5', name: '5-Win Streak', description: 'Win 5 games in a row', icon: '🔥' },
  { id: 'streak-10', name: '10-Win Streak', description: 'Win 10 games in a row', icon: '⚡' },
];

export default function StatsPage() {
  const { settings } = useTheme();
  const { stats, resetStats } = useStats();

  const winRate = stats.totalGames > 0 
    ? Math.round((stats.wins / stats.totalGames) * 100) 
    : 0;

  const avgMovesPerGame = stats.totalGames > 0
    ? Math.round(stats.totalMoves / stats.totalGames)
    : 0;

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
      resetStats();
    }
  };

  return (
    <div
      className="min-h-screen p-4 py-12"
      style={{ background: settings.theme.background }}
    >
      <div className="max-w-6xl mx-auto">
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
            📊 Statistics
          </h1>
          <p
            className="text-xl"
            style={{ color: settings.theme.textSecondary }}
          >
            Track your progress and achievements
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Games"
            value={stats.totalGames}
            icon="🎮"
            settings={settings}
            delay={0.1}
          />
          <StatCard
            title="Wins"
            value={stats.wins}
            icon="🏆"
            settings={settings}
            delay={0.2}
          />
          <StatCard
            title="Losses"
            value={stats.losses}
            icon="😔"
            settings={settings}
            delay={0.3}
          />
          <StatCard
            title="Win Rate"
            value={`${winRate}%`}
            icon="📈"
            settings={settings}
            delay={0.4}
          />
          <StatCard
            title="Win Streak"
            value={stats.winStreak}
            icon="🔥"
            settings={settings}
            delay={0.5}
          />
          <StatCard
            title="Best Streak"
            value={stats.bestWinStreak}
            icon="⚡"
            settings={settings}
            delay={0.6}
          />
          <StatCard
            title="Perfect Games"
            value={stats.perfectGames}
            icon="💎"
            settings={settings}
            delay={0.7}
          />
          <StatCard
            title="Avg Moves/Game"
            value={avgMovesPerGame}
            icon="🎯"
            settings={settings}
            delay={0.8}
          />
          <StatCard
            title="Hints Used"
            value={stats.hintsUsed}
            icon="💡"
            settings={settings}
            delay={0.9}
          />
        </div>

        {/* Achievements Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="p-8 rounded-2xl border-2 mb-8"
          style={{
            backgroundColor: settings.theme.cardBg,
            borderColor: settings.theme.cardBorder,
          }}
        >
          <h2
            className="text-3xl font-bold mb-6"
            style={{ color: settings.theme.textPrimary }}
          >
            🏅 Achievements ({stats.achievements.length}/{achievements.length})
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => {
              const isUnlocked = stats.achievements.includes(achievement.id);
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className={`p-4 rounded-xl border-2 ${
                    isUnlocked ? '' : 'opacity-50'
                  }`}
                  style={{
                    backgroundColor: isUnlocked
                      ? `${settings.theme.buttonPrimary}20`
                      : `${settings.theme.cardBorder}20`,
                    borderColor: isUnlocked
                      ? settings.theme.buttonPrimary
                      : settings.theme.cardBorder,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div
                        className="font-bold text-lg"
                        style={{ color: settings.theme.textPrimary }}
                      >
                        {achievement.name}
                      </div>
                      <div
                        className="text-sm"
                        style={{ color: settings.theme.textSecondary }}
                      >
                        {achievement.description}
                      </div>
                    </div>
                    {isUnlocked && (
                      <div className="text-2xl">✓</div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Navigation Buttons */}
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

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="px-8 py-3 rounded-lg font-semibold"
            style={{
              backgroundColor: `${settings.theme.cardBorder}40`,
              color: settings.theme.textPrimary,
            }}
          >
            🔄 Reset Stats
          </motion.button>

          <Link href="/mode-select">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-lg font-semibold text-white"
              style={{
                backgroundColor: settings.theme.buttonPrimary,
              }}
            >
              Play Now →
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  settings,
  delay,
}: {
  title: string;
  value: number | string;
  icon: string;
  settings: any;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="p-6 rounded-xl border-2 text-center"
      style={{
        backgroundColor: settings.theme.cardBg,
        borderColor: settings.theme.cardBorder,
      }}
    >
      <div className="text-4xl mb-2">{icon}</div>
      <div
        className="text-3xl font-bold mb-1"
        style={{ color: settings.theme.textPrimary }}
      >
        {value}
      </div>
      <div
        className="text-sm"
        style={{ color: settings.theme.textSecondary }}
      >
        {title}
      </div>
    </motion.div>
  );
}
