import React, { useEffect, useRef } from 'react';
import { Direction, ClueItem } from '../types';
import { Check, ArrowRight, ArrowDown } from 'lucide-react';

interface CluesPanelProps {
  clues: ClueItem[];
  activeClue: ClueItem | null;
  direction: Direction;
  userInput: Record<string, string>;
  onSelectClue: (clue: ClueItem) => void;
}

export const CluesPanel: React.FC<CluesPanelProps> = ({
  clues,
  activeClue,
  direction,
  userInput,
  onSelectClue,
}) => {
  const activeClueRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeClueRef.current) {
      activeClueRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeClue]);

  const acrossClues = clues.filter((c) => c.direction === 'across');
  const downClues = clues.filter((c) => c.direction === 'down');

  // Check if a clue's word has been completely filled and matches
  const isClueSolved = (clue: ClueItem): boolean => {
    let filled = '';
    for (let i = 0; i < clue.answer.length; i++) {
      const r = clue.direction === 'across' ? clue.row : clue.row + i;
      const c = clue.direction === 'across' ? clue.col + i : clue.col;
      const ch = userInput[`${r},${c}`];
      if (!ch) return false;
      filled += ch;
    }
    return filled === clue.answer;
  };

  const renderClueList = (list: ClueItem[], dir: Direction) => {
    return (
      <div className="space-y-1.5 overflow-y-auto max-h-[300px] sm:max-h-[460px] pr-1.5 custom-scrollbar">
        {list.map((c) => {
          const isActive =
            activeClue?.number === c.number && activeClue?.direction === c.direction;
          const isSolved = isClueSolved(c);

          return (
            <button
              key={`${c.direction}-${c.number}`}
              ref={isActive ? activeClueRef : null}
              type="button"
              onClick={() => onSelectClue(c)}
              className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                isActive
                  ? 'bg-amber-500/20 border-amber-500/80 shadow-sm text-stone-100'
                  : isSolved
                  ? 'bg-stone-900/40 border-stone-800/60 text-stone-400 hover:bg-stone-850 hover:text-stone-300'
                  : 'bg-stone-850 border-stone-750 text-stone-200 hover:bg-stone-800 hover:border-stone-600'
              }`}
            >
              <div
                className={`w-6 h-6 shrink-0 rounded-md flex items-center justify-center font-mono font-bold text-xs ${
                  isActive
                    ? 'bg-amber-500 text-stone-950'
                    : isSolved
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-stone-800 text-stone-300'
                }`}
              >
                {isSolved ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : c.number}
              </div>

              <div className="flex-1 min-w-0">
                <div
                  className={`text-xs sm:text-[13px] leading-snug ${
                    isSolved ? 'line-through text-stone-400' : 'text-stone-200'
                  }`}
                >
                  {c.clue}
                </div>
                <div className="text-[10px] text-stone-400 mt-1 font-mono">
                  {c.answer.length} letters
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
      {/* Across Clues Column */}
      <div className="bg-stone-900/90 rounded-2xl border border-stone-800 p-3 sm:p-4 flex flex-col">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-800">
          <div className="flex items-center gap-2 font-bold text-sm text-stone-200">
            <ArrowRight className="w-4 h-4 text-amber-400" />
            <span>Across</span>
          </div>
          <span className="text-[11px] font-mono text-stone-400">
            {acrossClues.length} clues
          </span>
        </div>
        {renderClueList(acrossClues, 'across')}
      </div>

      {/* Down Clues Column */}
      <div className="bg-stone-900/90 rounded-2xl border border-stone-800 p-3 sm:p-4 flex flex-col">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-800">
          <div className="flex items-center gap-2 font-bold text-sm text-stone-200">
            <ArrowDown className="w-4 h-4 text-amber-400" />
            <span>Down</span>
          </div>
          <span className="text-[11px] font-mono text-stone-400">
            {downClues.length} clues
          </span>
        </div>
        {renderClueList(downClues, 'down')}
      </div>
    </div>
  );
};
