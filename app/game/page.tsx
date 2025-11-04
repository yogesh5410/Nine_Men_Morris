'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { useStats } from '@/contexts/StatsContext';
import { useGameHistory } from '@/hooks/useGameHistory';
import { useAI } from '@/hooks/useAI';
import {
  GameState,
  initializeGame,
  placePiece,
  removePiece,
  selectPiece,
  getLegalMoves,
} from '@/lib/gameLogic';
import { Position } from '@/lib/boardConfig';
import EnhancedBoard from '@/components/EnhancedBoard';
import GameTimer from '@/components/GameTimer';
import TurnTimer from '@/components/TurnTimer';

function GameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'pvp';
  
  const { settings } = useTheme();
  const { session, endSession } = useStats();
  const { isAIThinking, getAIMove } = useAI();
  
  const [gameStartTime] = useState(Date.now());
  const [moveCount, setMoveCount] = useState(0);
  const [piecesLostByPlayer, setPiecesLostByPlayer] = useState({ white: 0, black: 0 });
  const [turnTimeoutEnabled] = useState(true); // Enable turn timer
  const [timerResetKey, setTimerResetKey] = useState(0); // For resetting timer
  const [lastMovedPosition, setLastMovedPosition] = useState<Position | null>(null); // Track last moved piece
  const [aiMoveEnabled, setAiMoveEnabled] = useState(true); // Control AI moves

  const {
    state: gameState,
    pushState,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
  } = useGameHistory(initializeGame());

  // AI player configuration
  const aiPlayer = mode.startsWith('ai-') ? 'black' : null;
  const aiDifficulty = mode === 'ai-easy' ? 'easy' : mode === 'ai-medium' ? 'medium' : mode === 'ai-hard' ? 'hard' : 'medium';

  // Track pieces lost for perfect game detection
  useEffect(() => {
    const whitePiecesPlaced = 9 - gameState.piecesRemaining.white;
    const blackPiecesPlaced = 9 - gameState.piecesRemaining.black;
    
    setPiecesLostByPlayer({
      white: whitePiecesPlaced - gameState.piecesOnBoard.white,
      black: blackPiecesPlaced - gameState.piecesOnBoard.black,
    });
  }, [gameState.piecesRemaining, gameState.piecesOnBoard]);

  // Execute AI move
  const executeAIMove = useCallback(async () => {
    if (!aiPlayer || gameState.phase === 'gameOver' || isAIThinking) return;
    if (gameState.currentPlayer !== aiPlayer) return;

    const aiMove = await getAIMove(gameState, aiPlayer, aiDifficulty);
    
    // If AI has no valid moves (blocked), trigger game over
    if (!aiMove) {
      // The opponent of AI (the human player) wins
      const winner = aiPlayer === 'black' ? 'white' : 'black';
      const newState: GameState = {
        ...gameState,
        phase: 'gameOver',
        winner,
        message: `${winner === 'white' ? 'White' : 'Black'} wins! AI has no valid moves.`,
      };
      pushState(newState);
      toast.success(`🎉 You win! AI has no valid moves.`, {
        icon: '👑',
        duration: 4000,
      });
      return;
    }
    
    if (aiMove) {
      let newState: GameState;
      
      if (aiMove.type === 'place') {
        newState = placePiece(gameState, aiMove.to);
        toast.success(`AI placed a piece`, {
          icon: '🤖',
          duration: 1500,
          id: 'ai-move',
        });
      } else if (aiMove.type === 'move') {
        let tempState = selectPiece(gameState, aiMove.from!);
        newState = selectPiece(tempState, aiMove.to);
        toast.success(`AI moved piece`, {
          icon: '🤖',
          duration: 1500,
          id: 'ai-move',
        });
      } else if (aiMove.type === 'remove') {
        newState = removePiece(gameState, aiMove.to);
        toast.error(`AI removed your piece!`, {
          icon: '💥',
          duration: 1500,
          id: 'ai-remove',
        });
      } else {
        return;
      }
      
      setMoveCount(prev => prev + 1);
      pushState(newState);

      // Check for mill formation
      if (newState.phase === 'removing' && newState.message.includes('Mill')) {
        toast('AI formed a mill! 🎯', {
          icon: '⚡',
          duration: 3000,
        });
      }
    }
  }, [aiPlayer, gameState, aiDifficulty, isAIThinking, getAIMove, pushState]);

  // Trigger AI move
  useEffect(() => {
    if (aiPlayer && gameState.currentPlayer === aiPlayer && gameState.phase !== 'gameOver' && !isAIThinking && aiMoveEnabled) {
      const timeout = setTimeout(() => {
        executeAIMove();
        setAiMoveEnabled(true); // Re-enable after move
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [aiPlayer, gameState.currentPlayer, gameState.phase, isAIThinking, executeAIMove]);

  // Handle position click
  const handlePositionClick = useCallback(
    (position: Position) => {
      if (isAIThinking || (aiPlayer && gameState.currentPlayer === aiPlayer)) return;
      if (gameState.phase === 'gameOver') return;

      const { phase, board, selectedPosition, currentPlayer } = gameState;
      let newState: GameState;

      const prevPhase = phase;

      switch (phase) {
        case 'placing':
          newState = placePiece(gameState, position);
          if (newState !== gameState) {
            toast.success(`Piece placed`, {
              icon: currentPlayer === 'white' ? '⚪' : '⚫',
              duration: 1000,
              id: 'place-piece',
            });
          }
          break;

        case 'removing':
          newState = removePiece(gameState, position);
          if (newState !== gameState && newState.phase !== 'removing') {
            toast.error(`Piece removed!`, {
              icon: '💥',
              duration: 1000,
              id: 'remove-piece',
            });
          }
          break;

        case 'moving':
        case 'flying':
          if (selectedPosition === null) {
            if (board[position] === currentPlayer) {
              newState = selectPiece(gameState, position);
            } else {
              newState = { ...gameState, message: 'Select your own piece to move' };
            }
          } else {
            if (position === selectedPosition) {
              newState = {
                ...gameState,
                selectedPosition: null,
                message: `${currentPlayer}'s turn - Select a piece to move`,
              };
            } else if (board[position] === currentPlayer) {
              newState = selectPiece(gameState, position);
            } else {
              newState = selectPiece(gameState, position);
              if (newState !== gameState && newState.selectedPosition === null) {
                toast.success(`Moved to position ${position}`, {
                  icon: '↔️',
                  duration: 1500,
                });
              }
            }
          }
          break;

        default:
          newState = gameState;
      }

      // Check for mill formation
      if (newState !== gameState && newState.phase === 'removing' && prevPhase !== 'removing') {
        toast('Mill formed! Remove an opponent piece! 🎯', {
          icon: '⭐',
          duration: 3000,
          style: {
            background: settings.theme.buttonPrimary,
            color: '#fff',
          },
        });
      }

      if (newState !== gameState) {
        setMoveCount(prev => prev + 1);
        setLastMovedPosition(position); // Track last moved position
        setAiMoveEnabled(true); // Re-enable AI moves
        pushState(newState);
      }
    },
    [gameState, pushState, isAIThinking, aiPlayer, settings.theme.buttonPrimary]
  );

  // Check for game over
  useEffect(() => {
    if (gameState.phase === 'gameOver' && session) {
      const winner = gameState.message.includes('white') ? 'white' : 'black';
      const isPlayerWin = aiPlayer ? winner !== aiPlayer : true;
      let isPerfect = false;
      if (isPlayerWin && aiPlayer) {
        const humanPlayer = aiPlayer === 'black' ? 'white' : 'black';
        isPerfect = piecesLostByPlayer[humanPlayer] === 0;
      }

      // Show win/loss popup
      if (isPlayerWin) {
        toast.success(isPerfect ? '🎉 Perfect Victory! 🎉' : '🏆 You Won! 🏆', {
          duration: 5000,
          style: {
            background: settings.theme.buttonPrimary,
            color: '#fff',
            fontSize: '18px',
            fontWeight: 'bold',
          },
        });
      } else {
        toast.error('😔 Game Over - You Lost', {
          duration: 5000,
          style: {
            fontSize: '18px',
            fontWeight: 'bold',
          },
        });
      }

      // Update stats
      endSession(
        isPlayerWin ? 'win' : 'loss',
        moveCount,
        isPerfect
      );
    }
  }, [gameState.phase, gameState.message, session, aiPlayer, moveCount, piecesLostByPlayer, endSession, settings.theme.buttonPrimary]);

  // Handle turn timeout (make random legal move)
  const handleTurnTimeout = useCallback(async () => {
    if (gameState.phase === 'gameOver') return;
    if (aiPlayer && gameState.currentPlayer === aiPlayer) return; // Don't timeout AI

    toast.error('⏰ Time\'s up! Making automatic move...', {
      duration: 2000,
      icon: '⏱️',
    });

    // Make a random legal move based on phase
    let newState: GameState;
    
    if (gameState.phase === 'placing') {
      // Find empty positions
      const emptyPositions: Position[] = [];
      for (let i = 0; i < 24; i++) {
        if (gameState.board[i] === null) {
          emptyPositions.push(i as Position);
        }
      }
      if (emptyPositions.length > 0) {
        const randomPos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
        newState = placePiece(gameState, randomPos);
      } else {
        return;
      }
    } else if (gameState.phase === 'moving' || gameState.phase === 'flying') {
      // Find a piece of current player and move it
      const playerPieces: Position[] = [];
      for (let i = 0; i < 24; i++) {
        if (gameState.board[i] === gameState.currentPlayer) {
          playerPieces.push(i as Position);
        }
      }
      if (playerPieces.length > 0) {
        const randomPiece = playerPieces[Math.floor(Math.random() * playerPieces.length)];
        const tempState = selectPiece(gameState, randomPiece);
        const moves = getLegalMoves(
          tempState.board,
          randomPiece,
          tempState.piecesOnBoard[tempState.currentPlayer!] === 3
        );
        if (moves.length > 0) {
          const randomMove = moves[Math.floor(Math.random() * moves.length)];
          newState = selectPiece(tempState, randomMove);
        } else {
          return;
        }
      } else {
        return;
      }
    } else if (gameState.phase === 'removing') {
      // Find opponent pieces to remove
      const opponent = gameState.currentPlayer === 'white' ? 'black' : 'white';
      const opponentPieces: Position[] = [];
      for (let i = 0; i < 24; i++) {
        if (gameState.board[i] === opponent) {
          opponentPieces.push(i as Position);
        }
      }
      if (opponentPieces.length > 0) {
        const randomPiece = opponentPieces[Math.floor(Math.random() * opponentPieces.length)];
        newState = removePiece(gameState, randomPiece);
      } else {
        return;
      }
    } else {
      return;
    }
    
    setMoveCount(prev => prev + 1);
    pushState(newState);
    
    toast('⚡ Automatic move made!', {
      icon: '🤖',
      duration: 2000,
    });
  }, [gameState, aiPlayer, pushState]);

  // Calculate legal moves for highlighting
  const legalMoves: Position[] =
    gameState.selectedPosition !== null &&
    (gameState.phase === 'moving' || gameState.phase === 'flying')
      ? getLegalMoves(
          gameState.board,
          gameState.selectedPosition,
          gameState.piecesOnBoard[gameState.currentPlayer!] === 3
        )
      : [];

  return (
    <div
      className="min-h-screen p-4 py-8"
      style={{ background: settings.theme.background }}
    >
      <Toaster position="top-center" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/mode-select">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-lg font-semibold"
              style={{
                backgroundColor: settings.theme.cardBg,
                borderColor: settings.theme.cardBorder,
                color: settings.theme.textPrimary,
                border: `2px solid ${settings.theme.cardBorder}`,
              }}
            >
              ← Back
            </motion.button>
          </Link>

          <div className="text-center">
            <h1
              className="text-4xl font-bold"
              style={{ color: settings.theme.textPrimary }}
            >
              🎯 Nine Men's Morris
            </h1>
            <p style={{ color: settings.theme.textSecondary }}>
              {mode === 'pvp' ? 'Player vs Player' : 
               mode === 'ai-easy' ? 'vs AI - Easy' :
               mode === 'ai-medium' ? 'vs AI - Medium' : 'vs AI - Hard'}
            </p>
          </div>

          <Link href="/settings">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-lg font-semibold"
              style={{
                backgroundColor: settings.theme.cardBg,
                borderColor: settings.theme.cardBorder,
                color: settings.theme.textPrimary,
                border: `2px solid ${settings.theme.cardBorder}`,
              }}
            >
              ⚙️
            </motion.button>
          </Link>
        </div>

        {/* Main Game Area */}
        <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
          {/* Board */}
          <div className="w-full max-w-3xl mx-auto lg:mx-0">
            <EnhancedBoard
              board={gameState.board}
              selectedPosition={gameState.selectedPosition}
              legalMoves={legalMoves}
              lastMovedPosition={lastMovedPosition}
              onPositionClick={handlePositionClick}
              phase={gameState.phase}
              theme={settings.theme}
              pieceStyle={settings.pieceStyle}
              animationsEnabled={settings.animationsEnabled}
            />
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {/* Game Timer */}
            <GameTimer 
              isRunning={gameState.phase !== 'gameOver'} 
              resetTrigger={timerResetKey}
            />

            {/* Turn Timer (30s per turn) */}
            {turnTimeoutEnabled && gameState.phase !== 'gameOver' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl border-2"
                style={{
                  backgroundColor: settings.theme.cardBg,
                  borderColor: settings.theme.cardBorder,
                }}
              >
                <TurnTimer
                  currentPlayer={gameState.currentPlayer}
                  isRunning={
                    // @ts-ignore - gamePhase can be 'gameOver'
                    gameState.phase !== 'gameOver' && 
                    !isAIThinking &&
                    !(aiPlayer && gameState.currentPlayer === aiPlayer)
                  }
                  onTimeout={handleTurnTimeout}
                  maxTime={30}
                  theme={settings.theme}
                  resetTrigger={timerResetKey}
                />
              </motion.div>
            )}

            {/* Game Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 rounded-2xl border-2"
              style={{
                backgroundColor: settings.theme.cardBg,
                borderColor: settings.theme.cardBorder,
              }}
            >
              <h3
                className="text-2xl font-bold mb-4"
                style={{ color: settings.theme.textPrimary }}
              >
                Game Status
              </h3>

              <div className="space-y-3">
                <InfoRow
                  label="Phase"
                  value={gameState.phase.charAt(0).toUpperCase() + gameState.phase.slice(1)}
                  theme={settings.theme}
                />
                <InfoRow
                  label="Current Turn"
                  value={gameState.currentPlayer?.toUpperCase() || 'Game Over'}
                  theme={settings.theme}
                />
                <InfoRow
                  label="Moves Made"
                  value={moveCount.toString()}
                  theme={settings.theme}
                />
                {session && (
                  <InfoRow
                    label="Hints Left"
                    value={`${session.hintsRemaining}/3`}
                    theme={settings.theme}
                  />
                )}
              </div>

              <div
                className="mt-4 p-3 rounded-lg text-center"
                style={{
                  backgroundColor: `${settings.theme.buttonPrimary}20`,
                  color: settings.theme.textPrimary,
                }}
              >
                {gameState.message}
              </div>
            </motion.div>

            {/* Controls */}
            <div className="grid grid-cols-3 gap-2">
              <motion.button
                whileHover={{ scale: canUndo ? 1.05 : 1 }}
                whileTap={{ scale: canUndo ? 0.95 : 1 }}
                onClick={() => {
                  setAiMoveEnabled(false); // Disable AI auto-move temporarily
                  undo();
                }}
                disabled={!canUndo}
                className="px-4 py-3 rounded-lg font-semibold"
                style={{
                  backgroundColor: canUndo ? settings.theme.buttonPrimary : `${settings.theme.cardBorder}40`,
                  color: canUndo ? '#fff' : settings.theme.textSecondary,
                  opacity: canUndo ? 1 : 0.5,
                  cursor: canUndo ? 'pointer' : 'not-allowed',
                }}
              >
                ↶ Undo
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (confirm('Reset the game?')) {
                    reset(initializeGame());
                    setMoveCount(0);
                    setTimerResetKey(prev => prev + 1); // Reset timer
                    toast('Game reset!', { icon: '🔄' });
                  }
                }}
                className="px-4 py-3 rounded-lg font-semibold"
                style={{
                  backgroundColor: settings.theme.cardBorder,
                  color: settings.theme.textPrimary,
                }}
              >
                🔄 Reset
              </motion.button>

              <motion.button
                whileHover={{ scale: canRedo ? 1.05 : 1 }}
                whileTap={{ scale: canRedo ? 0.95 : 1 }}
                onClick={() => {
                  setAiMoveEnabled(false); // Disable AI auto-move temporarily
                  redo();
                }}
                disabled={!canRedo}
                className="px-4 py-3 rounded-lg font-semibold"
                style={{
                  backgroundColor: canRedo ? settings.theme.buttonPrimary : `${settings.theme.cardBorder}40`,
                  color: canRedo ? '#fff' : settings.theme.textSecondary,
                  opacity: canRedo ? 1 : 0.5,
                  cursor: canRedo ? 'pointer' : 'not-allowed',
                }}
              >
                Redo ↷
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, theme }: { label: string; value: string; theme: any }) {
  return (
    <div className="flex justify-between items-center">
      <span style={{ color: theme.textSecondary }}>{label}:</span>
      <span className="font-bold" style={{ color: theme.textPrimary }}>
        {value}
      </span>
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GameContent />
    </Suspense>
  );
}
