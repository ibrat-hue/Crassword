import React from 'react';
import { Delete, ArrowRightLeft, Sparkles, CheckSquare, ArrowLeft, ArrowRight } from 'lucide-react';
import { Direction } from '../types';

interface VirtualKeyboardProps {
  onKeyPress: (char: string) => void;
  onBackspace: () => void;
  onToggleDirection: () => void;
  direction: Direction;
  onPrevClue: () => void;
  onNextClue: () => void;
  onRevealLetter: () => void;
  onCheckErrors: () => void;
  coins: number;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  onKeyPress,
  onBackspace,
  onToggleDirection,
  direction,
  onPrevClue,
  onNextClue,
  onRevealLetter,
  onCheckErrors,
  coins,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto bg-stone-900/95 border border-stone-800 rounded-2xl p-2 sm:p-3 shadow-lg flex flex-col gap-1.5 select-none">
      {/* Action Toolbar */}
      <div className="flex items-center justify-between gap-1.5 pb-1.5 border-b border-stone-800/80 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleDirection}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-750 text-[11px] font-semibold transition cursor-pointer"
            title="Switch typing direction (Space / Click cell)"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
            <span className="capitalize">{direction}</span>
          </button>

          <button
            type="button"
            onClick={onPrevClue}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-300 border border-stone-750 transition cursor-pointer"
            title="Previous Clue"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onNextClue}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-300 border border-stone-750 transition cursor-pointer"
            title="Next Clue"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onCheckErrors}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-750 text-[11px] font-medium transition cursor-pointer"
            title="Check for mistakes"
          >
            <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>Check</span>
          </button>

          <button
            type="button"
            onClick={onRevealLetter}
            disabled={coins < 15}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer border ${
              coins >= 15
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-stone-800/40 text-stone-500 border-stone-800 cursor-not-allowed'
            }`}
            title="Reveal letter (15 coins)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Hint (15)</span>
          </button>
        </div>
      </div>

      {/* Row 1 */}
      <div className="flex justify-center gap-1 sm:gap-1.5">
        {KEYBOARD_ROWS[0].map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onKeyPress(key)}
            className="flex-1 max-w-[42px] h-10 sm:h-11 rounded-lg bg-stone-800 hover:bg-stone-700 active:bg-amber-500 active:text-stone-950 font-mono font-bold text-sm sm:text-base text-stone-100 border border-stone-700/70 shadow-sm transition-colors cursor-pointer flex items-center justify-center"
          >
            {key}
          </button>
        ))}
      </div>

      {/* Row 2 */}
      <div className="flex justify-center gap-1 sm:gap-1.5 px-3 sm:px-4">
        {KEYBOARD_ROWS[1].map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onKeyPress(key)}
            className="flex-1 max-w-[42px] h-10 sm:h-11 rounded-lg bg-stone-800 hover:bg-stone-700 active:bg-amber-500 active:text-stone-950 font-mono font-bold text-sm sm:text-base text-stone-100 border border-stone-700/70 shadow-sm transition-colors cursor-pointer flex items-center justify-center"
          >
            {key}
          </button>
        ))}
      </div>

      {/* Row 3 with Backspace */}
      <div className="flex justify-center gap-1 sm:gap-1.5">
        <button
          type="button"
          onClick={onToggleDirection}
          className="flex-[1.4] max-w-[56px] h-10 sm:h-11 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700/70 font-sans font-semibold text-xs transition cursor-pointer flex items-center justify-center"
          title="Toggle Direction"
        >
          {direction === 'across' ? 'Across' : 'Down'}
        </button>

        {KEYBOARD_ROWS[2].map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onKeyPress(key)}
            className="flex-1 max-w-[42px] h-10 sm:h-11 rounded-lg bg-stone-800 hover:bg-stone-700 active:bg-amber-500 active:text-stone-950 font-mono font-bold text-sm sm:text-base text-stone-100 border border-stone-700/70 shadow-sm transition-colors cursor-pointer flex items-center justify-center"
          >
            {key}
          </button>
        ))}

        <button
          type="button"
          onClick={onBackspace}
          className="flex-[1.4] max-w-[56px] h-10 sm:h-11 rounded-lg bg-stone-800 hover:bg-stone-700 active:bg-rose-500 text-stone-200 border border-stone-700/70 transition cursor-pointer flex items-center justify-center"
          title="Backspace"
        >
          <Delete className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
