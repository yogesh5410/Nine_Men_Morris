'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
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
import GameOverModal from '@/components/GameOverModal';
import HintDisplay from '@/components/HintDisplay';
import { generateHint } from '@/lib/hintSystem';

function GameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'pvp';
  
  const { settings } = useTheme();
  const { session, endSession, startSession } = useStats();
  const { isAIThinking, getAIMove } = useAI();
  
  const processingRef = useRef(false);
  const [gameStartTime, setGameStartTime] = useState(Date.now());
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);
  
  // Counters
  const [moveCounts, setMoveCounts] = useState({ white: 0, black: 0 });
  const [playerHints, setPlayerHints] = useState({ white: 3, black: 3 });
  const [piecesLostByPlayer, setPiecesLostByPlayer] = useState({ white: 0, black: 0 });
  
  const [turnTimeoutEnabled] = useState(true);
  const [timerResetKey, setTimerResetKey] = useState(0);
  const [lastMovedPosition, setLastMovedPosition] = useState<Position | null>(null);
  const [aiMoveEnabled, setAiMoveEnabled] = useState(true);
  const [hintText, setHintText] = useState<string | null>(null);
  const [hintPositions, setHintPositions] = useState<Position[]>([]);
  const [showHintModal, setShowHintModal] = useState(false);

  const {
    state: gameState,
    pushState,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
  } = useGameHistory(initializeGame());

  const aiPlayer = mode.startsWith('ai-') ? 'black' : null;
  const aiDifficulty = mode === 'ai-easy' ? 'easy' : mode === 'ai-medium' ? 'medium' : mode === 'ai-hard' ? 'hard' : 'medium';

  useEffect(() => {
    const whitePiecesPlaced = 9 - gameState.piecesRemaining.white;
    const blackPiecesPlaced = 9 - gameState.piecesRemaining.black;
    setPiecesLostByPlayer({
      white: whitePiecesPlaced - gameState.piecesOnBoard.white,
      black: blackPiecesPlaced - gameState.piecesOnBoard.black,
    });
  }, [gameState.piecesRemaining, gameState.piecesOnBoard]);

  // AI Move Logic
  const executeAIMove = useCallback(async () => {
    if (processingRef.current) return;
    if (!aiPlayer || gameState.phase === 'gameOver' || isAIThinking) return;
    if (gameState.currentPlayer !== aiPlayer) return;

    processingRef.current = true;

    try {
      const aiMove = await getAIMove(gameState, aiPlayer, aiDifficulty);
      
      if (!aiMove) {
        const winner = aiPlayer === 'black' ? 'white' : 'black';
        const newState: GameState = {
          ...gameState,
          phase: 'gameOver',
          winner,
          message: `${winner === 'white' ? 'White' : 'Black'} wins! AI has no valid moves.`,
        };
        pushState(newState);
        toast.success(`🎉 You win! AI has no valid moves.`, { icon: '👑', duration: 4000 });
      } else {
        let newState: GameState;
        
        if (aiMove.type === 'place') {
          newState = placePiece(gameState, aiMove.to);
          toast.success(`AI placed a piece`, { icon: '🤖', duration: 1500 });
        } else if (aiMove.type === 'move') {
          let tempState = selectPiece(gameState, aiMove.from!);
          newState = selectPiece(tempState, aiMove.to);
          toast.success(`AI moved piece`, { icon: '🤖', duration: 1500 });
        } else if (aiMove.type === 'remove') {
          newState = removePiece(gameState, aiMove.to);
          toast.error(`AI removed your piece!`, { icon: '💥', duration: 1500 });
        } else {
          processingRef.current = false;
          return;
        }
        
        setMoveCounts(prev => ({ ...prev, [aiPlayer]: prev[aiPlayer] + 1 }));
        pushState(newState);

        if (newState.phase === 'removing' && newState.message.includes('Mill')) {
          toast('AI formed a mill!', { icon: '⚡' });
        }
      }
    } catch (e) {
      console.error("AI Error", e);
    } finally {
      setTimeout(() => { processingRef.current = false; }, 500);
    }
  }, [aiPlayer, gameState, aiDifficulty, isAIThinking, getAIMove, pushState]);

  useEffect(() => {
    if (aiPlayer && gameState.currentPlayer === aiPlayer && gameState.phase !== 'gameOver' && !isAIThinking && aiMoveEnabled) {
      const timeout = setTimeout(() => {
        executeAIMove();
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [aiPlayer, gameState.currentPlayer, gameState.phase, isAIThinking, executeAIMove, aiMoveEnabled]);

  // Player Move
  const handlePositionClick = useCallback(
    (position: Position) => {
      if (processingRef.current) return;
      if (isAIThinking || (aiPlayer && gameState.currentPlayer === aiPlayer)) return;
      if (gameState.phase === 'gameOver') return;

      const { phase, board, selectedPosition, currentPlayer } = gameState;
      let newState: GameState;
      const prevPhase = phase;

      switch (phase) {
        case 'placing':
          newState = placePiece(gameState, position);
          if (newState !== gameState) toast.success(`Piece placed`, { icon: '📍', duration: 1000 });
          break;
        case 'removing':
          newState = removePiece(gameState, position);
          if (newState !== gameState) toast.error(`Piece removed!`, { icon: '💥', duration: 1000 });
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
            if (position === selectedPosition) newState = { ...gameState, selectedPosition: null };
            else if (board[position] === currentPlayer) newState = selectPiece(gameState, position);
            else newState = selectPiece(gameState, position);
          }
          break;
        default:
          newState = gameState;
      }

      if (newState !== gameState && newState.phase === 'removing' && prevPhase !== 'removing') {
        toast('Mill formed! Remove opponent piece!', { icon: '⭐' });
      }

      if (newState !== gameState) {
        if (newState.board !== gameState.board && currentPlayer) {
          setMoveCounts(prev => ({ ...prev, [currentPlayer]: prev[currentPlayer] + 1 }));
        }
        setLastMovedPosition(position);
        setAiMoveEnabled(true);
        pushState(newState);
      }
    },
    [gameState, pushState, isAIThinking, aiPlayer]
  );

  // Timeout
  const handleTurnTimeout = useCallback(async () => {
    // If hints modal is open, do not timeout
    if (showHintModal) return;
    if (processingRef.current) return;
    if (gameState.phase === 'gameOver') return;
    
    const currentPlayer = gameState.currentPlayer;
    if (!currentPlayer) return;
    if (aiPlayer && currentPlayer === aiPlayer) return;

    processingRef.current = true;

    // STRICT CHECK: Only proceed if > 0 hints
    if (playerHints[currentPlayer] > 0) {
      setPlayerHints(prev => ({
        ...prev,
        [currentPlayer]: prev[currentPlayer] - 1
      }));

      toast.error(`Time's up! Used hint for auto-move!`, { icon: '⏱️' });

      let newState: GameState | null = null;
      
      // Auto-Move Logic
      if (gameState.phase === 'placing') {
        const empties: Position[] = [];
        for (let i = 0; i < 24; i++) if (gameState.board[i] === null) empties.push(i as Position);
        if (empties.length > 0) newState = placePiece(gameState, empties[Math.floor(Math.random() * empties.length)]);
      } else if (gameState.phase === 'moving' || gameState.phase === 'flying') {
        const myPieces: Position[] = [];
        for (let i = 0; i < 24; i++) if (gameState.board[i] === gameState.currentPlayer) myPieces.push(i as Position);
        const shuffled = myPieces.sort(() => 0.5 - Math.random());
        for (const p of shuffled) {
          const temp = selectPiece(gameState, p);
          const moves = getLegalMoves(temp.board, p, temp.piecesOnBoard[currentPlayer] === 3);
          if (moves.length > 0) {
            newState = selectPiece(temp, moves[0]);
            break;
          }
        }
      } else if (gameState.phase === 'removing') {
        const opp = currentPlayer === 'white' ? 'black' : 'white';
        const oppPieces: Position[] = [];
        for (let i = 0; i < 24; i++) if (gameState.board[i] === opp) oppPieces.push(i as Position);
        for (const p of oppPieces) {
          const test = removePiece(gameState, p);
          if (test !== gameState) { newState = test; break; }
        }
      }

      if (newState) {
        setMoveCounts(prev => ({ ...prev, [currentPlayer]: prev[currentPlayer] + 1 }));
        pushState(newState);
      }
    } else {
      // Lose Game immediately if 0 hints
      const opponent = currentPlayer === 'white' ? 'black' : 'white';
      const newState: GameState = {
        ...gameState,
        phase: 'gameOver',
        winner: opponent,
        message: `Time's up! ${currentPlayer} ran out of hints.`,
      };
      pushState(newState);
      toast.error('You Lost! No hints left.', { icon: '💀' });
    }

    setTimeout(() => { processingRef.current = false; }, 500);
  }, [gameState, aiPlayer, playerHints, pushState, showHintModal]);

  const handleGetHint = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentPlayer = gameState.currentPlayer;
    if (!currentPlayer) return;

    if (playerHints[currentPlayer] > 0) {
      setPlayerHints(prev => ({ ...prev, [currentPlayer]: prev[currentPlayer] - 1 }));
      const hint = await generateHint(gameState, aiDifficulty as any);
      if (hint) {
        setHintText(hint.reason);
        setHintPositions(hint.from !== undefined ? [hint.from, hint.to] : [hint.to]);
        setShowHintModal(true);
        setTimeout(() => setHintPositions([]), 5000);
      }
    } else {
      toast.error('No hints remaining!');
    }
  };

  const legalMoves = gameState.selectedPosition !== null && (gameState.phase === 'moving' || gameState.phase === 'flying')
      ? getLegalMoves(gameState.board, gameState.selectedPosition, gameState.piecesOnBoard[gameState.currentPlayer!] === 3)
      : [];

  // --- Game Over Calculations ---
  const totalTimeSeconds = gameEndTime ? Math.max(0, Math.floor((gameEndTime - gameStartTime) / 1000)) : Math.max(0, Math.floor((Date.now() - gameStartTime) / 1000));
  const modalIsPerfect = (() => {
    if (!aiPlayer) return false;
    const humanPlayer = aiPlayer === 'black' ? 'white' : 'black';
    return piecesLostByPlayer[humanPlayer] === 0;
  })();

  // --- Game Over Logic Hook ---
  useEffect(() => {
    if (gameState.phase === 'gameOver' && session) {
      setGameEndTime(Date.now());
      const isPlayerWin = aiPlayer ? gameState.winner !== aiPlayer : true;
      
      if (isPlayerWin) {
        toast.success(modalIsPerfect ? '🎉 Perfect Victory! 🎉' : '🏆 You Won! 🏆', { duration: 5000 });
      } else {
        toast.error('😔 Game Over - You Lost', { duration: 5000 });
      }
      
      endSession(isPlayerWin ? 'win' : 'loss', moveCounts.white + moveCounts.black, modalIsPerfect);
    }
  }, [gameState.phase, aiPlayer, gameState.winner]); 

  const gameOverContent = (
    <GameOverModal
      winner={gameState.winner}
      aiMode={!!aiPlayer}
      humanPlayer={aiPlayer ? (aiPlayer === 'black' ? 'white' : 'black') : null}
      isPlayerWin={aiPlayer ? gameState.winner !== aiPlayer : true}
      moves={moveCounts.white + moveCounts.black}
      isPerfect={modalIsPerfect}
      totalTimeSeconds={totalTimeSeconds}
      onPlayAgain={() => {
        reset(initializeGame());
        setMoveCounts({ white: 0, black: 0 });
        setPlayerHints({ white: 3, black: 3 });
        setTimerResetKey(prev => prev + 1);
        setGameStartTime(Date.now());
        setGameEndTime(null);
        try { startSession(mode as any); } catch (e) {}
      }}
      onBack={() => router.push('/mode-select')}
      theme={settings.theme}
    />
  );

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
              currentPlayer={gameState.currentPlayer}
              hintPositions={hintPositions}
              theme={settings.theme}
              pieceStyle={settings.pieceStyle}
              animationsEnabled={settings.animationsEnabled}
            />
          </div>

          {/* Game Over Modal */}
          {gameState.phase === 'gameOver' && gameOverContent}

          {/* Hint Modal */}
          {showHintModal && (
            <HintDisplay
              hint={hintText}
              onClose={() => { setShowHintModal(false); setHintText(null); }}
            />
          )}

          {/* Side Panel */}
          <div className="space-y-4">
            {/* Game Timer */}
            <GameTimer 
              isRunning={gameState.phase !== 'gameOver' && !showHintModal} 
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
                    // @ts-ignore
                    gameState.phase !== 'gameOver' && 
                    !isAIThinking &&
                    !(aiPlayer && gameState.currentPlayer === aiPlayer) &&
                    !showHintModal
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
              <h3 className="text-2xl font-bold mb-4" style={{ color: settings.theme.textPrimary }}>
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
                
                <div className="h-px bg-gray-300 my-2 opacity-50"></div>
                
                {/* Player Stats */}
                <div className="flex justify-between">
                  <span style={{ color: settings.theme.textSecondary }}>⚪ White Moves:</span>
                  <span className="font-bold" style={{ color: settings.theme.textPrimary }}>{moveCounts.white}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: settings.theme.textSecondary }}>⚫ Black Moves:</span>
                  <span className="font-bold" style={{ color: settings.theme.textPrimary }}>{moveCounts.black}</span>
                </div>
                
                <div className="h-px bg-gray-300 my-2 opacity-50"></div>

                {/* Hints */}
                <div className="flex justify-between">
                  <span style={{ color: settings.theme.textSecondary }}>⚪ White Hints:</span>
                  <span className="font-bold" style={{ color: settings.theme.textPrimary }}>{playerHints.white}/3</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: settings.theme.textSecondary }}>⚫ Black Hints:</span>
                  <span className="font-bold" style={{ color: settings.theme.textPrimary }}>{playerHints.black}/3</span>
                </div>
              </div>

              {/* Get Hint Button */}
              {gameState.phase !== 'gameOver' && (
                <div className="mt-4 flex justify-center lg:justify-start">
                  <button
                    onClick={handleGetHint}
                    disabled={!gameState.currentPlayer || playerHints[gameState.currentPlayer] <= 0}
                    className={`w-full px-4 py-2 rounded-lg font-semibold transition-all ${
                      !gameState.currentPlayer || playerHints[gameState.currentPlayer] <= 0 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:scale-105 active:scale-95'
                    }`}
                    style={{ backgroundColor: settings.theme.buttonPrimary, color: '#fff' }}
                  >
                    💡 Get Hint
                  </button>
                </div>
              )}

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
                  setAiMoveEnabled(false);
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
                    setMoveCounts({ white: 0, black: 0 });
                    setPlayerHints({ white: 3, black: 3 });
                    setTimerResetKey(prev => prev + 1);
                    setGameStartTime(Date.now());
                    setGameEndTime(null);
                    try { startSession(mode as any); } catch (e) {}
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
                  setAiMoveEnabled(false);
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