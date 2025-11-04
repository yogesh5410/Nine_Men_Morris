import { useState, useCallback } from 'react';
import { GameState } from '@/lib/gameLogic';
import { Player } from '@/lib/boardConfig';
import { AIMove, Difficulty } from '@/lib/aiEngine';

interface UseAIReturn {
  isAIThinking: boolean;
  getAIMove: (gameState: GameState, aiPlayer: Player, difficulty: Difficulty) => Promise<AIMove | null>;
  error: string | null;
}

export function useAI(): UseAIReturn {
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAIMove = useCallback(async (
    gameState: GameState,
    aiPlayer: Player,
    difficulty: Difficulty
  ): Promise<AIMove | null> => {
    setIsAIThinking(true);
    setError(null);

    try {
      // Add artificial delay for better UX (makes AI feel more "thoughtful")
      const minThinkingTime = difficulty === 'hard' ? 800 : difficulty === 'medium' ? 500 : 300;
      const startTime = Date.now();

      const response = await fetch('/api/ai-move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameState,
          aiPlayer,
          difficulty,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI move');
      }

      // Ensure minimum thinking time has passed
      const elapsed = Date.now() - startTime;
      if (elapsed < minThinkingTime) {
        await new Promise(resolve => setTimeout(resolve, minThinkingTime - elapsed));
      }

      return data.move;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('AI move error:', err);
      return null;
    } finally {
      setIsAIThinking(false);
    }
  }, []);

  return {
    isAIThinking,
    getAIMove,
    error,
  };
}
