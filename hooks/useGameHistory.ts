'use client';

import { useState, useCallback, useRef } from 'react';
import { GameState } from '@/lib/gameLogic';

interface GameHistory {
  past: GameState[];
  present: GameState;
  future: GameState[];
}

export function useGameHistory(initialState: GameState) {
  const [history, setHistory] = useState<GameHistory>({
    past: [],
    present: initialState,
    future: [],
  });

  const maxHistorySize = useRef(50); // Limit history size

  /**
   * Add a new state to history
   */
  const pushState = useCallback((newState: GameState) => {
    setHistory((prev) => {
      const newPast = [...prev.past, prev.present];
      
      // Limit history size
      if (newPast.length > maxHistorySize.current) {
        newPast.shift();
      }

      return {
        past: newPast,
        present: newState,
        future: [], // Clear future when new action taken
      };
    });
  }, []);

  /**
   * Undo last action
   */
  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;

      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, prev.past.length - 1);

      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  /**
   * Redo last undone action
   */
  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;

      const next = prev.future[0];
      const newFuture = prev.future.slice(1);

      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  /**
   * Reset history with new state
   */
  const reset = useCallback((newState: GameState) => {
    setHistory({
      past: [],
      present: newState,
      future: [],
    });
  }, []);

  /**
   * Clear all history
   */
  const clear = useCallback(() => {
    setHistory((prev) => ({
      past: [],
      present: prev.present,
      future: [],
    }));
  }, []);

  return {
    state: history.present,
    pushState,
    undo,
    redo,
    reset,
    clear,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    historySize: history.past.length,
  };
}
