import React, { useRef, useEffect } from 'react';
import { Direction, GridCell, ClueItem } from '../types';

interface CrosswordGridProps {
  grid: GridCell[][];
  gridSize: number;
  userInput: Record<string, string>;
  selectedCell: { row: number; col: number } | null;
  direction: Direction;
  activeClue: ClueItem | null;
  errorCells: Set<string>;
  onCellClick: (row: number, col: number) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export const CrosswordGrid: React.FC<CrosswordGridProps> = ({
  grid,
  gridSize,
  userInput,
  selectedCell,
  direction,
  activeClue,
  errorCells,
  onCellClick,
  onKeyDown,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep focus on the container for keyboard input
  useEffect(() => {
    if (selectedCell && containerRef.current) {
      containerRef.current.focus();
    }
  }, [selectedCell]);

  // Determine cells that belong to active clue's word
  const activeWordCells = new Set<string>();
  if (activeClue) {
    for (let i = 0; i < activeClue.answer.length; i++) {
      const r = activeClue.direction === 'across' ? activeClue.row : activeClue.row + i;
      const c = activeClue.direction === 'across' ? activeClue.col + i : activeClue.col;
      activeWordCells.add(`${r},${c}`);
    }
  }

  // Calculate cell sizing style
  const maxBoardDim = Math.min(540, typeof window !== 'undefined' ? window.innerWidth - 36 : 500);
  const gapSize = 4;
  const paddingSize = 16;
  const calculatedCell = Math.floor((maxBoardDim - paddingSize - (gridSize - 1) * gapSize) / gridSize);
  const cellSize = Math.max(22, Math.min(52, calculatedCell));

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="w-full max-w-full overflow-x-auto outline-none select-none flex flex-col items-center justify-center p-2.5 sm:p-5 bg-stone-900/90 rounded-2xl border border-stone-800 shadow-xl custom-scrollbar"
    >
      <div
        className="grid gap-1 bg-stone-950 p-1.5 sm:p-2.5 rounded-xl border border-stone-800 shrink-0"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
        }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const coordKey = `${r},${c}`;
            const isBlocked = cell.isBlocked;
            const isSelected = selectedCell?.row === r && selectedCell?.col === c;
            const isInActiveWord = activeWordCells.has(coordKey);
            const isError = errorCells.has(coordKey);
            const userLetter = userInput[coordKey] || '';
            const clueNum = cell.clueNumber;

            if (isBlocked) {
              return (
                <div
                  key={coordKey}
                  className="bg-stone-950 rounded-md border border-stone-900/40"
                  style={{ width: cellSize, height: cellSize }}
                />
              );
            }

            return (
              <button
                key={coordKey}
                type="button"
                onClick={() => onCellClick(r, c)}
                className={`relative flex items-center justify-center rounded-md font-['JetBrains_Mono',monospace] font-bold text-center transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-300 z-20 shadow-md'
                    : isError
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/60 animate-pulse'
                    : isInActiveWord
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                    : 'bg-stone-800/90 text-stone-100 hover:bg-stone-750 border border-stone-700/80'
                }`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  fontSize: Math.max(11, Math.floor(cellSize * 0.52)),
                }}
              >
                {/* Clue Number Badge */}
                {clueNum !== undefined && (
                  <span
                    className={`absolute top-0.5 left-0.5 sm:left-1 text-[8px] sm:text-[9px] font-sans font-bold leading-none select-none pointer-events-none ${
                      isSelected ? 'text-stone-900 font-extrabold' : 'text-stone-400'
                    }`}
                  >
                    {clueNum}
                  </span>
                )}

                {/* Entered Character */}
                <span className="mt-0.5">{userLetter}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
