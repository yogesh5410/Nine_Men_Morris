'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface GameStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winStreak: number;
  bestWinStreak: number;
  totalMoves: number;
  perfectGames: number; // Games won without losing a piece
  hintsUsed: number;
  achievements: string[];
}

export interface GameSession {
  mode: 'pvp' | 'ai-easy' | 'ai-medium' | 'ai-hard';
  hintsRemaining: number;
  startTime: number;
}

interface StatsContextType {
  stats: GameStats;
  session: GameSession | null;
  startSession: (mode: GameSession['mode']) => void;
  endSession: (result: 'win' | 'loss' | 'draw', moveCount: number, isPerfect: boolean) => void;
  useHint: () => boolean;
  resetStats: () => void;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

const initialStats: GameStats = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  winStreak: 0,
  bestWinStreak: 0,
  totalMoves: 0,
  perfectGames: 0,
  hintsUsed: 0,
  achievements: [],
};

export function StatsProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<GameStats>(initialStats);
  const [session, setSession] = useState<GameSession | null>(null);

  // Load stats from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('gameStats');
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (e) {
        console.error('Failed to load stats:', e);
      }
    }
  }, []);

  // Save stats to localStorage
  useEffect(() => {
    localStorage.setItem('gameStats', JSON.stringify(stats));
  }, [stats]);

  const startSession = (mode: GameSession['mode']) => {
    setSession({
      mode,
      hintsRemaining: 3,
      startTime: Date.now(),
    });
  };

  const checkAchievements = (newStats: GameStats) => {
    const achievements = [...newStats.achievements];
    
    if (newStats.wins >= 1 && !achievements.includes('first-win')) {
      achievements.push('first-win');
    }
    if (newStats.wins >= 10 && !achievements.includes('veteran')) {
      achievements.push('veteran');
    }
    if (newStats.wins >= 50 && !achievements.includes('master')) {
      achievements.push('master');
    }
    if (newStats.perfectGames >= 1 && !achievements.includes('perfect')) {
      achievements.push('perfect');
    }
    if (newStats.bestWinStreak >= 5 && !achievements.includes('streak-5')) {
      achievements.push('streak-5');
    }
    if (newStats.bestWinStreak >= 10 && !achievements.includes('streak-10')) {
      achievements.push('streak-10');
    }
    
    return achievements;
  };

  const endSession = (result: 'win' | 'loss' | 'draw', moveCount: number, isPerfect: boolean) => {
    if (!session) return;

    setStats(prev => {
      const newStats = {
        ...prev,
        totalGames: prev.totalGames + 1,
        wins: result === 'win' ? prev.wins + 1 : prev.wins,
        losses: result === 'loss' ? prev.losses + 1 : prev.losses,
        draws: result === 'draw' ? prev.draws + 1 : prev.draws,
        winStreak: result === 'win' ? prev.winStreak + 1 : 0,
        bestWinStreak: result === 'win' 
          ? Math.max(prev.bestWinStreak, prev.winStreak + 1)
          : prev.bestWinStreak,
        totalMoves: prev.totalMoves + moveCount,
        perfectGames: (result === 'win' && isPerfect) ? prev.perfectGames + 1 : prev.perfectGames,
        achievements: prev.achievements,
      };

      newStats.achievements = checkAchievements(newStats);

      return newStats;
    });

    setSession(null);
  };

  const useHint = () => {
    if (!session || session.hintsRemaining <= 0) {
      return false;
    }

    setSession(prev => prev ? { ...prev, hintsRemaining: prev.hintsRemaining - 1 } : null);
    setStats(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
    
    return true;
  };

  const resetStats = () => {
    setStats(initialStats);
    localStorage.removeItem('gameStats');
  };

  return (
    <StatsContext.Provider
      value={{
        stats,
        session,
        startSession,
        endSession,
        useHint,
        resetStats,
      }}
    >
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error('useStats must be used within StatsProvider');
  }
  return context;
}
