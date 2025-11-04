'use client';

import React from 'react';

interface GameControlsProps {
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  canUndo: boolean;
  canRedo: boolean;
  historySize: number;
}

export default function GameControls({
  onUndo,
  onRedo,
  onReset,
  canUndo,
  canRedo,
  historySize,
}: GameControlsProps) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-lg border-2 border-amber-600">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-amber-900">Game Controls</h3>
        <p className="text-sm text-amber-700">History: {historySize} moves</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {/* Undo Button */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`px-4 py-3 rounded-lg font-bold transition-all transform ${
            canUndo
              ? 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105 active:scale-95 cursor-pointer'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
          }`}
          title="Undo last move (Ctrl+Z)"
        >
          <div className="flex flex-col items-center">
            <span className="text-2xl">↶</span>
            <span className="text-xs mt-1">Undo</span>
          </div>
        </button>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 active:scale-95"
          title="Start new game"
        >
          <div className="flex flex-col items-center">
            <span className="text-2xl">🔄</span>
            <span className="text-xs mt-1">Reset</span>
          </div>
        </button>

        {/* Redo Button */}
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`px-4 py-3 rounded-lg font-bold transition-all transform ${
            canRedo
              ? 'bg-green-500 hover:bg-green-600 text-white hover:scale-105 active:scale-95 cursor-pointer'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
          }`}
          title="Redo last undone move (Ctrl+Y)"
        >
          <div className="flex flex-col items-center">
            <span className="text-2xl">↷</span>
            <span className="text-xs mt-1">Redo</span>
          </div>
        </button>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
        <p className="text-xs font-semibold text-amber-900 mb-2">⌨️ Shortcuts:</p>
        <div className="text-xs text-amber-800 space-y-1">
          <div><kbd className="px-1 py-0.5 bg-white border border-amber-300 rounded">Ctrl+Z</kbd> Undo</div>
          <div><kbd className="px-1 py-0.5 bg-white border border-amber-300 rounded">Ctrl+Y</kbd> Redo</div>
          <div><kbd className="px-1 py-0.5 bg-white border border-amber-300 rounded">Ctrl+R</kbd> Reset</div>
        </div>
      </div>
    </div>
  );
}
