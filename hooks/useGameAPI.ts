'use client';

import { useState, useCallback } from 'react';
import { GameState } from '@/lib/gameLogic';
import { Position } from '@/lib/boardConfig';

interface MoveAPIResponse {
  success: boolean;
  gameState?: GameState;
  valid?: boolean;
  error?: string;
}

export function useGameAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Validate and execute a move via API
   */
  const validateMove = useCallback(
    async (
      gameState: GameState,
      action: 'place' | 'move' | 'remove' | 'select',
      params: { position?: Position; from?: Position; to?: Position }
    ): Promise<GameState | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/move', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            gameState,
            action,
            ...params,
          }),
        });

        const data: MoveAPIResponse = await response.json();

        if (!response.ok || !data.success) {
          setError(data.error || 'Move validation failed');
          return null;
        }

        return data.gameState || null;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Network error';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Save game state
   */
  const saveGame = useCallback(
    async (gameId: string, gameState: GameState): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/game', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'save',
            gameId,
            gameState,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.error || 'Failed to save game');
          return false;
        }

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Network error';
        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Load game state
   */
  const loadGame = useCallback(async (gameId: string): Promise<GameState | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'load',
          gameId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to load game');
        return null;
      }

      return data.gameState;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new game
   */
  const createGame = useCallback(async (): Promise<{
    gameId: string;
    gameState: GameState;
  } | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to create game');
        return null;
      }

      return {
        gameId: data.gameId,
        gameState: data.gameState,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    validateMove,
    saveGame,
    loadGame,
    createGame,
    loading,
    error,
    clearError: () => setError(null),
  };
}
