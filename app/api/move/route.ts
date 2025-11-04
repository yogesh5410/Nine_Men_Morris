import { NextRequest, NextResponse } from 'next/server';
import {
  GameState,
  placePiece,
  movePiece,
  removePiece,
  selectPiece,
  checkWinCondition,
} from '@/lib/gameLogic';
import { validateTransition } from '@/lib/gameFSM';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameState, action, position, from, to } = body;

    if (!gameState || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: gameState and action' },
        { status: 400 }
      );
    }

    let newState: GameState = gameState;

    // Execute action based on type
    switch (action) {
      case 'place':
        if (typeof position !== 'number') {
          return NextResponse.json(
            { error: 'Position is required for place action' },
            { status: 400 }
          );
        }
        newState = placePiece(gameState, position);
        break;

      case 'move':
        if (typeof from !== 'number' || typeof to !== 'number') {
          return NextResponse.json(
            { error: 'From and to positions are required for move action' },
            { status: 400 }
          );
        }
        newState = movePiece(gameState, from, to);
        break;

      case 'remove':
        if (typeof position !== 'number') {
          return NextResponse.json(
            { error: 'Position is required for remove action' },
            { status: 400 }
          );
        }
        newState = removePiece(gameState, position);
        break;

      case 'select':
        if (typeof position !== 'number') {
          return NextResponse.json(
            { error: 'Position is required for select action' },
            { status: 400 }
          );
        }
        newState = selectPiece(gameState, position);
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    // Validate phase transition
    if (newState.phase !== gameState.phase) {
      const validation = validateTransition(gameState.phase, newState.phase);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }
    }

    // Check win condition
    const winner = checkWinCondition(newState);
    if (winner) {
      newState = { ...newState, winner, phase: 'gameOver' };
    }

    return NextResponse.json({
      success: true,
      gameState: newState,
      valid: true,
    });
  } catch (error) {
    console.error('Move validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Move validation API',
    endpoints: {
      POST: '/api/move - Validate and execute a move',
    },
  });
}
