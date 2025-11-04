'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { useStats } from '@/contexts/StatsContext';

export default function Home() {
  const { settings } = useTheme();
  const { stats } = useStats();

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: settings.theme.background }}
    >
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 
            className="text-7xl font-bold mb-4"
            style={{ color: settings.theme.textPrimary }}
          >
            🎯 Nine Men's Morris
          </h1>
          <p 
            className="text-2xl mb-2"
            style={{ color: settings.theme.textSecondary }}
          >
            The Ultimate Strategy Game
          </p>
          <p 
            className="text-lg"
            style={{ color: settings.theme.textSecondary }}
          >
            Ancient Game • Modern Experience • AI Powered
          </p>
        </motion.div>

        {/* Main Menu Buttons */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <MenuCard
            href="/tutorial"
            icon="📚"
            title="Tutorial"
            description="Learn how to play"
            delay={0.4}
            settings={settings}
          />
          <MenuCard
            href="/mode-select"
            icon="🎮"
            title="Play Game"
            description="Start a new game"
            delay={0.5}
            settings={settings}
            highlight
          />
          <MenuCard
            href="/settings"
            icon="⚙️"
            title="Settings"
            description="Customize your experience"
            delay={0.6}
            settings={settings}
          />
          <MenuCard
            href="/stats"
            icon="📊"
            title="Statistics"
            description="View your achievements"
            delay={0.7}
            settings={settings}
          />
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-center"
          style={{ color: settings.theme.textSecondary }}
        >
          <p className="text-sm">
            Features: Multiple Themes • AI Opponent • Hints System • Achievements
          </p>
        </motion.div>
      </div>
    </div>
  );
}

interface MenuCardProps {
  href: string;
  icon: string;
  title: string;
  description: string;
  delay: number;
  settings: any;
  highlight?: boolean;
}

function MenuCard({ href, icon, title, description, delay, settings, highlight }: MenuCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
    >
      <Link href={href}>
        <div
          className="p-8 rounded-2xl border-2 cursor-pointer transition-all"
          style={{
            backgroundColor: settings.theme.cardBg,
            borderColor: highlight ? settings.theme.buttonPrimary : settings.theme.cardBorder,
            boxShadow: highlight ? `0 0 0 4px ${settings.theme.buttonPrimary}40` : 'none',
          }}
        >
          <div className="text-5xl mb-4">{icon}</div>
          <h3 className="text-2xl font-bold mb-2" style={{ color: settings.theme.textPrimary }}>
            {title}
          </h3>
          <p style={{ color: settings.theme.textSecondary }}>
            {description}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
