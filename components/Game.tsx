'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Board from './Board';
import GameInfo from './GameInfo';
import GameControls from './GameControls';
import AISettings from './AISettings';
import {
  GameState,
  initializeGame,
  placePiece,
  removePiece,
  selectPiece,
  getLegalMoves,
} from '@/lib/gameLogic';
import { Position, Player } from '@/lib/boardConfig';
import { useGameHistory } from '@/hooks/useGameHistory';
import { useAI } from '@/hooks/useAI';
import { Difficulty } from '@/lib/aiEngine';

export default function Game() {
  const [useAPI, setUseAPI] = useState(false);
  const [isAIEnabled, setIsAIEnabled] = useState(false);
  const [aiPlayer, setAIPlayer] = useState<Player>('black');
  const [aiDifficulty, setAIDifficulty] = useState<Difficulty>('medium');
  
  const {
    state: gameState,
    pushState,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    historySize,
  } = useGameHistory(initializeGame());
  
  const { isAIThinking, getAIMove } = useAI();

  // AI Move Handler
  const executeAIMove = useCallback(async () => {
    if (!isAIEnabled || gameState.phase === 'gameOver' || isAIThinking) {
      return;
    }

    if (gameState.currentPlayer === aiPlayer) {
      const aiMove = await getAIMove(gameState, aiPlayer, aiDifficulty);
      
      if (aiMove) {
        let newState: GameState;
        
        if (aiMove.type === 'place') {
          newState = placePiece(gameState, aiMove.to);
        } else if (aiMove.type === 'move') {
          // Select piece first, then move
          let tempState = selectPiece(gameState, aiMove.from!);
          newState = selectPiece(tempState, aiMove.to);
        } else if (aiMove.type === 'remove') {
          newState = removePiece(gameState, aiMove.to);
        } else {
          return;
        }
        
        pushState(newState);
      }
    }
  }, [isAIEnabled, gameState, aiPlayer, aiDifficulty, isAIThinking, getAIMove, pushState]);

  // Trigger AI move when it's AI's turn
  useEffect(() => {
    if (isAIEnabled && 
        gameState.currentPlayer === aiPlayer && 
        gameState.phase !== 'gameOver' &&
        !isAIThinking) {
      // Small delay for better UX
      const timeout = setTimeout(() => {
        executeAIMove();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isAIEnabled, gameState.currentPlayer, gameState.phase, aiPlayer, isAIThinking, executeAIMove]);

  const handlePositionClick = useCallback(
    (position: Position) => {
      // Block input when AI is thinking or it's AI's turn
      if (isAIThinking || (isAIEnabled && gameState.currentPlayer === aiPlayer)) {
        return;
      }

      const { phase, board, selectedPosition, piecesOnBoard, currentPlayer } = gameState;

      if (phase === 'gameOver') {
        return;
      }

      let newState: GameState;

      switch (phase) {
        case 'placing':
          // Place a new piece
          newState = placePiece(gameState, position);
          break;

        case 'removing':
          // Remove opponent's piece after forming a mill
          newState = removePiece(gameState, position);
          break;

        case 'moving':
        case 'flying':
          // Select a piece or move selected piece
          if (selectedPosition === null) {
            // First click - select a piece
            if (board[position] === currentPlayer) {
              newState = selectPiece(gameState, position);
            } else {
              newState = { ...gameState, message: 'Select your own piece to move' };
            }
          } else {
            // Second click - try to move to destination
            if (position === selectedPosition) {
              // Deselect if clicking same piece
              newState = {
                ...gameState,
                selectedPosition: null,
                message: `${currentPlayer}'s turn - Select a piece to move`,
              };
            } else if (board[position] === currentPlayer) {
              // Select different piece
              newState = selectPiece(gameState, position);
            } else {
              // Try to move to empty position
              newState = selectPiece(gameState, position);
            }
          }
          break;

        default:
          newState = gameState;
      }

      pushState(newState);
    },
    [gameState, pushState, isAIThinking, isAIEnabled, aiPlayer]
  );

  const handleReset = useCallback(() => {
    reset(initializeGame());
  }, [reset]);

  const handleToggleAI = useCallback(() => {
    setIsAIEnabled(prev => !prev);
    // Reset game when toggling AI
    if (!isAIEnabled) {
      handleReset();
    }
  }, [isAIEnabled, handleReset]);

  const handleAIPlayerChange = useCallback((player: Player) => {
    setAIPlayer(player);
    // Reset game when changing AI player
    handleReset();
  }, [handleReset]);

  const handleDifficultyChange = useCallback((difficulty: Difficulty) => {
    setAIDifficulty(difficulty);
  }, []);

  const handleUndo = useCallback(() => {
    if (canUndo) {
      undo();
    }
  }, [canUndo, undo]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      redo();
    }
  }, [canRedo, redo]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z - Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Ctrl+Y or Cmd+Shift+Z - Redo
      else if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
      ) {
        e.preventDefault();
        handleRedo();
      }
      // Ctrl+R or Cmd+R - Reset (prevent browser refresh)
      else if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        if (window.confirm('Are you sure you want to reset the game?')) {
          handleReset();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleReset]);

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
    <div className="min-h-screen bg-linear-to-br from-amber-100 via-orange-50 to-amber-200 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-amber-900 mb-2 drop-shadow-lg">
            🎯 Nine Men's Morris
          </h1>
          <p className="text-amber-800 text-lg">
            An ancient strategy board game
          </p>
        </div>

        {/* Main Game Area */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Board */}
          <div className="order-2 lg:order-1">
            <Board
              board={gameState.board}
              selectedPosition={gameState.selectedPosition}
              legalMoves={legalMoves}
              onPositionClick={handlePositionClick}
              phase={gameState.phase}
            />
          </div>

          {/* Game Info & Controls */}
          <div className="order-1 lg:order-2 space-y-4">
            <GameInfo gameState={gameState} onReset={handleReset} />
            <AISettings
              isAIEnabled={isAIEnabled}
              onToggleAI={handleToggleAI}
              aiPlayer={aiPlayer}
              onAIPlayerChange={handleAIPlayerChange}
              aiDifficulty={aiDifficulty}
              onDifficultyChange={handleDifficultyChange}
              isAIThinking={isAIThinking}
            />
            <GameControls
              onUndo={handleUndo}
              onRedo={handleRedo}
              onReset={handleReset}
              canUndo={canUndo}
              canRedo={canRedo}
              historySize={historySize}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-amber-800 text-sm">
          <p>Built with Next.js • Week 3 - AI Complete ✅</p>
        </div>
      </div>
    </div>
  );
}
