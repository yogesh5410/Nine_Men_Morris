'use client';

import { Difficulty } from '@/lib/aiEngine';
import { Player } from '@/lib/boardConfig';
import { motion } from 'framer-motion';

interface AISettingsProps {
  isAIEnabled: boolean;
  onToggleAI: () => void;
  aiPlayer: Player;
  onAIPlayerChange: (player: Player) => void;
  aiDifficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  isAIThinking?: boolean;
}

export default function AISettings({
  isAIEnabled,
  onToggleAI,
  aiPlayer,
  onAIPlayerChange,
  aiDifficulty,
  onDifficultyChange,
  isAIThinking = false,
}: AISettingsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4"
    >
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
        AI Settings
      </h2>

      {/* AI Toggle */}
      <div className="flex items-center justify-between">
        <label htmlFor="ai-toggle" className="text-lg font-medium text-gray-700 dark:text-gray-300">
          Play vs AI
        </label>
        <button
          id="ai-toggle"
          onClick={onToggleAI}
          disabled={isAIThinking}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
            isAIEnabled
              ? 'bg-blue-600'
              : 'bg-gray-300 dark:bg-gray-600'
          } ${isAIThinking ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              isAIEnabled ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* AI Player Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          AI plays as
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => onAIPlayerChange('white')}
            disabled={!isAIEnabled || isAIThinking}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              aiPlayer === 'white'
                ? 'bg-white text-gray-800 ring-2 ring-blue-600 shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            } ${!isAIEnabled || isAIThinking ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            White
          </button>
          <button
            onClick={() => onAIPlayerChange('black')}
            disabled={!isAIEnabled || isAIThinking}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              aiPlayer === 'black'
                ? 'bg-gray-800 text-white ring-2 ring-blue-600 shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            } ${!isAIEnabled || isAIThinking ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Black
          </button>
        </div>
      </div>

      {/* Difficulty Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Difficulty
        </label>
        <div className="flex gap-2">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => onDifficultyChange(difficulty)}
              disabled={!isAIEnabled || isAIThinking}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                aiDifficulty === difficulty
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              } ${!isAIEnabled || isAIThinking ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {difficulty}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Info */}
      {isAIEnabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3"
        >
          {aiDifficulty === 'easy' && (
            <>
              <strong>Easy:</strong> AI looks 2 moves ahead. Good for beginners learning the game.
            </>
          )}
          {aiDifficulty === 'medium' && (
            <>
              <strong>Medium:</strong> AI looks 4 moves ahead. Balanced challenge for intermediate players.
            </>
          )}
          {aiDifficulty === 'hard' && (
            <>
              <strong>Hard:</strong> AI looks 6 moves ahead. Challenging opponent for experienced players.
            </>
          )}
        </motion.div>
      )}

      {/* AI Thinking Indicator */}
      {isAIThinking && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4"
        >
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-blue-600 rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            AI is thinking...
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
