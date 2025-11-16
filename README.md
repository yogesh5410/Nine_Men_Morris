# 🎯 Nine Men's Morris

A complete implementation of the classic strategy board game Nine Men's Morris (also known as Mill) built with Next.js, TypeScript, and Tailwind CSS. Features include full game logic, undo/redo functionality, smooth animations, and an intelligent AI opponent.

![Nine Men's Morris](https://img.shields.io/badge/Game-Nine%20Men's%20Morris-orange)
![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-cyan)

## 📋 Table of Contents

- [Game Features](#-game-features)
- [Getting Started](#-getting-started)
- [How to Play](#-how-to-play)
- [Playing Against AI](#-playing-against-ai)
- [Features in Detail](#-features-in-detail)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)

## 📖 How to Play

### Game Setup
- The game is played on a board with 24 positions (intersections)
- Each player has 9 pieces (white and black)
- White always moves first

### Phase 1: Placing (Turns 1-18)
1. Players alternate placing one piece per turn on any empty position
2. When you form a **mill** (three pieces in a row):
   - You may remove one opponent piece
   - Cannot remove pieces in mills unless all opponent pieces are in mills

### Phase 2: Moving (After all pieces placed)
1. Move one piece per turn to an adjacent empty position
2. Form mills to remove opponent pieces
3. When reduced to 3 pieces, you can **fly** (jump to any empty position)

### Winning the Game
You win when:
- Your opponent has only 2 pieces left, OR
- Your opponent cannot make a legal move

## 🤖 Playing Against AI

1. **Enable AI**: Toggle the "Play vs AI" switch
2. **Choose Color**: Select whether AI plays as White or Black
3. **Set Difficulty**: Choose Easy, Medium, or Hard
4. **Play**: Make your moves - AI will respond automatically

**Tips for Beating AI**:
- **Easy**: Focus on basic strategy, AI makes mistakes
- **Medium**: Plan 2-3 moves ahead, look for mill opportunities
- **Hard**: Requires expert play, AI rarely makes mistakes

## 🎯 Features in Detail

### Board Representation
- Graph-based structure with adjacency lists
- 24 positions organized in three concentric squares
- 16 possible mill combinations
- SVG rendering for crisp display at any resolution

### Game Logic
- Immutable state management
- Pure functions for game operations
- Comprehensive validation for all moves
- Automatic phase transitions

### AI Engine
- **Algorithm**: Minimax with Alpha-Beta pruning
- **Search Depth**: 2-6 plies depending on difficulty
- **Evaluation Factors**:
  - Material advantage (100 points per piece)
  - Formed mills (50 points)
  - Potential mills (30 points)
  - Mobility (20 points per legal move)
  - Center control (10 points)
  - Blocked pieces (-40 points)
  - Win/loss detection (±10000 points)
- **Move Generation**: Handles all three game phases
- **Performance**: < 5 seconds on hard difficulty

### History System
- Stack-based implementation
- Stores up to 50 game states
- Supports unlimited undo/redo within limit
- Memory-efficient state storage

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd Nine_Men_Morris
```

2. **Install dependencies**:
```bash
npm install
```

3. **Run the development server**:
```bash
npm run dev
```

4. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm start
```

## �️ Tech Stack

### Frontend
- **Next.js 16.0.1**: React framework with App Router
- **React 19**: UI library
- **TypeScript 5.0**: Type safety
- **Tailwind CSS 4.0**: Utility-first styling
- **Framer Motion 11**: Animation library

### Backend
- **Next.js API Routes**: REST API endpoints
- **Edge Runtime**: Fast serverless functions

### Development
- **ESLint**: Code linting
- **Webpack**: Module bundling

## �📁 Project Structure

```
Nine_Men_Morris/
├── app/
│   ├── api/
│   │   ├── ai-move/
│   │   │   └── route.ts          # AI move endpoint
│   │   ├── game/
│   │   │   └── route.ts          # Game state CRUD
│   │   └── move/
│   │       └── route.ts          # Move validation
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/
│   ├── Board.tsx                 # Game board SVG
│   ├── Game.tsx                  # Main game controller
│   ├── GameInfo.tsx              # Status display
│   ├── GameControls.tsx          # Undo/redo buttons
│   └── AISettings.tsx            # AI configuration
├── lib/
│   ├── boardConfig.ts            # Board structure & constants
│   ├── gameLogic.ts              # Core game rules
│   ├── gameFSM.ts                # Finite state machine
│   └── aiEngine.ts               # AI with Minimax
├── hooks/
│   ├── useGameHistory.ts         # Undo/redo hook
│   ├── useGameAPI.ts             # API integration
│   └── useAI.ts                  # AI integration
├── public/                       # Static assets
├── DEVELOPMENT_PLAN.md           # 30-day roadmap
├── WEEK3_SUMMARY.md              # AI implementation details
├── TESTING_GUIDE.md              # Comprehensive test cases
└── README.md                     # This file
```

### Quick Test
1. Start the dev server
2. Open http://localhost:3000
3. Play a complete game manually
4. Enable AI and play against it
5. Test undo/redo functionality

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- Additional AI algorithms 
- Multiplayer support (WebSockets)
- Persistent game state (localStorage/database)
- Tournament mode
- Statistics tracking
- Sound effects
- Theme customization
- Mobile app version

## 📄 License

This project is open source and available under the MIT License.

## � Acknowledgments

- Game design: Ancient strategy game, origins unknown
- Implementation inspired by various online versions
- AI algorithm based on classic game theory
- Built with modern web technologies

## 🎉 Enjoy the Game!

Have fun playing Nine Men's Morris! Whether you're learning the game or challenging yourself against the AI, we hope you enjoy this classic strategy game.

**Play Now**: [http://localhost:3000](http://localhost:3000)

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies**

**Status**: ✅ Week 1 Complete | ✅ Week 2 Complete | ✅ Week 3 Complete
