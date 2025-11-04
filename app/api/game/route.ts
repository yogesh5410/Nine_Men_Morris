import { NextRequest, NextResponse } from 'next/server';
import { initializeGame, GameState } from '@/lib/gameLogic';

// In-memory storage (for demo - would use database in production)
let gameStates: Map<string, GameState> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, gameId, gameState } = body;

    switch (action) {
      case 'create':
        // Create new game
        const newGameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newGame = initializeGame();
        gameStates.set(newGameId, newGame);
        
        return NextResponse.json({
          success: true,
          gameId: newGameId,
          gameState: newGame,
        });

      case 'save':
        if (!gameId || !gameState) {
          return NextResponse.json(
            { error: 'gameId and gameState are required for save action' },
            { status: 400 }
          );
        }
        gameStates.set(gameId, gameState);
        
        return NextResponse.json({
          success: true,
          message: 'Game saved successfully',
          gameId,
        });

      case 'load':
        if (!gameId) {
          return NextResponse.json(
            { error: 'gameId is required for load action' },
            { status: 400 }
          );
        }
        
        const loadedGame = gameStates.get(gameId);
        if (!loadedGame) {
          return NextResponse.json(
            { error: 'Game not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({
          success: true,
          gameState: loadedGame,
        });

      case 'delete':
        if (!gameId) {
          return NextResponse.json(
            { error: 'gameId is required for delete action' },
            { status: 400 }
          );
        }
        
        gameStates.delete(gameId);
        
        return NextResponse.json({
          success: true,
          message: 'Game deleted successfully',
        });

      case 'list':
        const games = Array.from(gameStates.keys());
        
        return NextResponse.json({
          success: true,
          games,
          count: games.length,
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Game state error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const gameId = searchParams.get('gameId');

  if (gameId) {
    const game = gameStates.get(gameId);
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      gameState: game,
    });
  }

  // Return list of games
  const games = Array.from(gameStates.keys());
  return NextResponse.json({
    success: true,
    games,
    count: games.length,
  });
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const gameId = searchParams.get('gameId');

  if (!gameId) {
    return NextResponse.json(
      { error: 'gameId is required' },
      { status: 400 }
    );
  }

  gameStates.delete(gameId);
  
  return NextResponse.json({
    success: true,
    message: 'Game deleted successfully',
  });
}
