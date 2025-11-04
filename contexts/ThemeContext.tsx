'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Theme {
  id: string;
  name: string;
  boardBg: string;
  boardLines: string;
  boardPoints: string;
  whitePiece: string;
  blackPiece: string;
  highlightLegal: string;
  highlightSelected: string;
  background: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  buttonPrimary: string;
  buttonHover: string;
}

export const themes: Theme[] = [
  {
    id: 'classic',
    name: 'Classic Wood',
    boardBg: '#d4a574',
    boardLines: '#8b4513',
    boardPoints: '#654321',
    whitePiece: '#ffffff',
    blackPiece: '#1a1a1a',
    highlightLegal: '#10b981',
    highlightSelected: '#3b82f6',
    background: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)',
    cardBg: '#ffffff',
    cardBorder: '#d97706',
    textPrimary: '#78350f',
    textSecondary: '#92400e',
    buttonPrimary: '#d97706',
    buttonHover: '#b45309',
  },
  {
    id: 'modern-dark',
    name: 'Modern Dark',
    boardBg: '#1f2937',
    boardLines: '#60a5fa',
    boardPoints: '#93c5fd',
    whitePiece: '#f3f4f6',
    blackPiece: '#111827',
    highlightLegal: '#34d399',
    highlightSelected: '#60a5fa',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    cardBg: '#1f2937',
    cardBorder: '#3b82f6',
    textPrimary: '#f3f4f6',
    textSecondary: '#9ca3af',
    buttonPrimary: '#3b82f6',
    buttonHover: '#2563eb',
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    boardBg: '#0ea5e9',
    boardLines: '#0369a1',
    boardPoints: '#075985',
    whitePiece: '#f0f9ff',
    blackPiece: '#0c4a6e',
    highlightLegal: '#22d3ee',
    highlightSelected: '#06b6d4',
    background: 'linear-gradient(135deg, #e0f2fe 0%, #7dd3fc 100%)',
    cardBg: '#f0f9ff',
    cardBorder: '#0284c7',
    textPrimary: '#0c4a6e',
    textSecondary: '#075985',
    buttonPrimary: '#0284c7',
    buttonHover: '#0369a1',
  },
  {
    id: 'forest',
    name: 'Forest Green',
    boardBg: '#22c55e',
    boardLines: '#15803d',
    boardPoints: '#166534',
    whitePiece: '#f0fdf4',
    blackPiece: '#14532d',
    highlightLegal: '#86efac',
    highlightSelected: '#4ade80',
    background: 'linear-gradient(135deg, #dcfce7 0%, #86efac 100%)',
    cardBg: '#f0fdf4',
    cardBorder: '#16a34a',
    textPrimary: '#14532d',
    textSecondary: '#166534',
    buttonPrimary: '#16a34a',
    buttonHover: '#15803d',
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    boardBg: '#f97316',
    boardLines: '#c2410c',
    boardPoints: '#9a3412',
    whitePiece: '#fff7ed',
    blackPiece: '#7c2d12',
    highlightLegal: '#fdba74',
    highlightSelected: '#fb923c',
    background: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)',
    cardBg: '#fff7ed',
    cardBorder: '#ea580c',
    textPrimary: '#7c2d12',
    textSecondary: '#9a3412',
    buttonPrimary: '#ea580c',
    buttonHover: '#c2410c',
  },
  {
    id: 'neon',
    name: 'Neon Purple',
    boardBg: '#a855f7',
    boardLines: '#7e22ce',
    boardPoints: '#6b21a8',
    whitePiece: '#faf5ff',
    blackPiece: '#581c87',
    highlightLegal: '#d8b4fe',
    highlightSelected: '#c084fc',
    background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)',
    cardBg: '#2e1065',
    cardBorder: '#9333ea',
    textPrimary: '#faf5ff',
    textSecondary: '#e9d5ff',
    buttonPrimary: '#9333ea',
    buttonHover: '#7e22ce',
  },
];

export type PieceStyle = 'circle' | 'square' | 'hexagon' | 'triangle' | 'star' | 'diamond';

export interface GameSettings {
  theme: Theme;
  pieceStyle: PieceStyle;
  soundEnabled: boolean;
  musicEnabled: boolean;
  animationsEnabled: boolean;
  volume: number;
}

interface ThemeContextType {
  settings: GameSettings;
  updateTheme: (themeId: string) => void;
  updatePieceStyle: (style: PieceStyle) => void;
  toggleSound: () => void;
  toggleMusic: () => void;
  toggleAnimations: () => void;
  setVolume: (volume: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<GameSettings>({
    theme: themes[0],
    pieceStyle: 'circle',
    soundEnabled: true,
    musicEnabled: false,
    animationsEnabled: true,
    volume: 0.7,
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('gameSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        const theme = themes.find(t => t.id === parsed.themeId) || themes[0];
        setSettings({
          theme,
          pieceStyle: parsed.pieceStyle || 'circle',
          soundEnabled: parsed.soundEnabled ?? true,
          musicEnabled: parsed.musicEnabled ?? false,
          animationsEnabled: parsed.animationsEnabled ?? true,
          volume: parsed.volume ?? 0.7,
        });
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    const toSave = {
      themeId: settings.theme.id,
      pieceStyle: settings.pieceStyle,
      soundEnabled: settings.soundEnabled,
      musicEnabled: settings.musicEnabled,
      animationsEnabled: settings.animationsEnabled,
      volume: settings.volume,
    };
    localStorage.setItem('gameSettings', JSON.stringify(toSave));
  }, [settings]);

  const updateTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      setSettings(prev => ({ ...prev, theme }));
    }
  };

  const updatePieceStyle = (style: PieceStyle) => {
    setSettings(prev => ({ ...prev, pieceStyle: style }));
  };

  const toggleSound = () => {
    setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const toggleMusic = () => {
    setSettings(prev => ({ ...prev, musicEnabled: !prev.musicEnabled }));
  };

  const toggleAnimations = () => {
    setSettings(prev => ({ ...prev, animationsEnabled: !prev.animationsEnabled }));
  };

  const setVolume = (volume: number) => {
    setSettings(prev => ({ ...prev, volume }));
  };

  return (
    <ThemeContext.Provider
      value={{
        settings,
        updateTheme,
        updatePieceStyle,
        toggleSound,
        toggleMusic,
        toggleAnimations,
        setVolume,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
