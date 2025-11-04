import { NextRequest, NextResponse } from 'next/server';
import { GameState } from '@/lib/gameLogic';
import { Player } from '@/lib/boardConfig';
import { getAIMove, AIMove, Difficulty } from '@/lib/aiEngine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameState, aiPlayer, difficulty } = body;

    if (!gameState) {
      return NextResponse.json(
        { error: 'gameState is required' },
        { status: 400 }
      );
    }

    if (!aiPlayer || (aiPlayer !== 'white' && aiPlayer !== 'black')) {
      return NextResponse.json(
        { error: 'aiPlayer must be "white" or "black"' },
        { status: 400 }
      );
    }

    const validDifficulties: Difficulty[] = ['easy', 'medium', 'hard'];
    const selectedDifficulty: Difficulty = validDifficulties.includes(difficulty)
      ? difficulty
      : 'medium';

    // Get AI move
    const aiMove: AIMove | null = getAIMove(
      gameState as GameState,
      aiPlayer as Player,
      selectedDifficulty
    );

    // If no valid move found, AI has no moves (blocked) - game over
    if (!aiMove) {
      return NextResponse.json({
        success: true,
        move: null,
        blocked: true,
        difficulty: selectedDifficulty,
      });
    }

    return NextResponse.json({
      success: true,
      move: aiMove,
      blocked: false,
      difficulty: selectedDifficulty,
    });
  } catch (error) {
    console.error('AI move error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
      );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AI Move API',
    endpoints: {
      POST: '/api/ai-move - Get AI move for current game state',
    },
    parameters: {
      gameState: 'Current game state object',
      aiPlayer: '"white" or "black"',
      difficulty: '"easy", "medium", or "hard" (default: medium)',
    },
  });
}
