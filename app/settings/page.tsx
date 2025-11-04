'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme, themes, PieceStyle } from '@/contexts/ThemeContext';

const pieceStyles: { id: PieceStyle; name: string; icon: string }[] = [
  { id: 'circle', name: 'Circle', icon: '⚪' },
  { id: 'square', name: 'Square', icon: '⬜' },
  { id: 'hexagon', name: 'Hexagon', icon: '⬡' },
  { id: 'triangle', name: 'Triangle', icon: '△' },
  { id: 'star', name: 'Star', icon: '⭐' },
  { id: 'diamond', name: 'Diamond', icon: '◆' },
];

export default function SettingsPage() {
  const {
    settings,
    updateTheme,
    updatePieceStyle,
    toggleSound,
    toggleMusic,
    toggleAnimations,
    setVolume,
  } = useTheme();

  return (
    <div
      className="min-h-screen p-4 py-12"
      style={{ background: settings.theme.background }}
    >
      <div className="max-w-4xl mx-auto">
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
            ⚙️ Settings
          </h1>
          <p
            className="text-xl"
            style={{ color: settings.theme.textSecondary }}
          >
            Customize your gaming experience
          </p>
        </motion.div>

        <div className="space-y-8">
          {/* Theme Selection */}
          <Section title="🎨 Theme" settings={settings}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {themes.map((theme, index) => (
                <motion.button
                  key={theme.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateTheme(theme.id)}
                  className={`p-4 rounded-xl border-2 ${
                    settings.theme.id === theme.id ? 'ring-4' : ''
                  }`}
                  style={{
                    backgroundColor: theme.cardBg,
                    borderColor: theme.cardBorder,
                    boxShadow: settings.theme.id === theme.id 
                      ? `0 0 0 4px ${theme.buttonPrimary}40` 
                      : 'none',
                  }}
                >
                  <div className="text-2xl mb-2">{getThemeIcon(theme.id)}</div>
                  <div className="font-semibold" style={{ color: theme.textPrimary }}>
                    {theme.name}
                  </div>
                  {settings.theme.id === theme.id && (
                    <div className="text-sm mt-1" style={{ color: theme.textSecondary }}>
                      ✓ Active
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </Section>

          {/* Piece Style Selection */}
          <Section title="🎲 Piece Style" settings={settings}>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {pieceStyles.map((style, index) => (
                <motion.button
                  key={style.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => updatePieceStyle(style.id)}
                  className={`p-4 rounded-xl border-2 ${
                    settings.pieceStyle === style.id ? 'ring-4' : ''
                  }`}
                  style={{
                    backgroundColor: settings.theme.cardBg,
                    borderColor: settings.theme.cardBorder,
                    boxShadow: settings.pieceStyle === style.id
                      ? `0 0 0 4px ${settings.theme.buttonPrimary}40`
                      : 'none',
                  }}
                >
                  <div className="text-4xl mb-2">{style.icon}</div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: settings.theme.textPrimary }}
                  >
                    {style.name}
                  </div>
                </motion.button>
              ))}
            </div>
          </Section>

          {/* Sound & Music */}
          <Section title="🔊 Audio" settings={settings}>
            <div className="space-y-4">
              <ToggleOption
                label="Sound Effects"
                enabled={settings.soundEnabled}
                onToggle={toggleSound}
                settings={settings}
              />
              <ToggleOption
                label="Background Music"
                enabled={settings.musicEnabled}
                onToggle={toggleMusic}
                settings={settings}
              />
              
              {/* Volume Control */}
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: settings.theme.textPrimary }}
                >
                  Volume: {Math.round(settings.volume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${settings.theme.buttonPrimary} 0%, ${settings.theme.buttonPrimary} ${settings.volume * 100}%, ${settings.theme.cardBorder}40 ${settings.volume * 100}%, ${settings.theme.cardBorder}40 100%)`,
                  }}
                />
              </div>
            </div>
          </Section>

          {/* Animations */}
          <Section title="✨ Visual Effects" settings={settings}>
            <ToggleOption
              label="Smooth Animations"
              enabled={settings.animationsEnabled}
              onToggle={toggleAnimations}
              settings={settings}
            />
          </Section>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4 mt-12">
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

          <Link href="/mode-select">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-lg font-semibold text-white"
              style={{
                backgroundColor: settings.theme.buttonPrimary,
              }}
            >
              Start Game →
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  settings,
}: {
  title: string;
  children: React.ReactNode;
  settings: any;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl border-2"
      style={{
        backgroundColor: settings.theme.cardBg,
        borderColor: settings.theme.cardBorder,
      }}
    >
      <h2
        className="text-2xl font-bold mb-6"
        style={{ color: settings.theme.textPrimary }}
      >
        {title}
      </h2>
      {children}
    </motion.div>
  );
}

function ToggleOption({
  label,
  enabled,
  onToggle,
  settings,
}: {
  label: string;
  enabled: boolean;
  onToggle: () => void;
  settings: any;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className="text-lg font-medium"
        style={{ color: settings.theme.textPrimary }}
      >
        {label}
      </span>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors`}
        style={{
          backgroundColor: enabled
            ? settings.theme.buttonPrimary
            : `${settings.theme.cardBorder}80`,
        }}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

function getThemeIcon(themeId: string): string {
  const icons: Record<string, string> = {
    classic: '🪵',
    'modern-dark': '🌙',
    ocean: '🌊',
    forest: '🌲',
    sunset: '🌅',
    neon: '💜',
  };
  return icons[themeId] || '🎨';
}
