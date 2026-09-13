import React from 'react';
import { X, Keyboard, ArrowRightLeft, Sparkles, Trophy, Lightbulb } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-stone-100">How to Play Crossword Quest</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3.5 my-4 text-xs sm:text-sm text-stone-300">
          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-stone-850 border border-stone-750">
            <div className="w-7 h-7 rounded-md bg-stone-800 flex items-center justify-center shrink-0 text-amber-400">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-stone-100 block mb-0.5">Typing & Moving</strong>
              Type letters on your keyboard or use the on-screen keypad. Typing automatically advances to the next cell. Use Arrow keys to navigate freely.
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-stone-850 border border-stone-750">
            <div className="w-7 h-7 rounded-md bg-stone-800 flex items-center justify-center shrink-0 text-amber-400">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-stone-100 block mb-0.5">Toggling Direction</strong>
              Click on the currently selected cell, press <kbd className="px-1.5 py-0.5 rounded bg-stone-700 font-mono text-[11px]">Space</kbd>, or tap the Across/Down button to switch direction.
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-stone-850 border border-stone-750">
            <div className="w-7 h-7 rounded-md bg-stone-800 flex items-center justify-center shrink-0 text-amber-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-stone-100 block mb-0.5">50 Levels & Milestones</strong>
              Puzzles grow from 5×5 introductory grids up to 13×13 Master challenges. Every 5th level (5, 10, 15, 20...) is a Milestone Level with custom trophy badges and coin rewards!
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-stone-850 border border-stone-750">
            <div className="w-7 h-7 rounded-md bg-stone-800 flex items-center justify-center shrink-0 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-stone-100 block mb-0.5">Hints & Check</strong>
              Stuck on a tricky clue? Use <span className="text-amber-400 font-semibold">Hint</span> to reveal a letter or <span className="text-cyan-400 font-semibold">Check</span> to find mistakes.
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition cursor-pointer"
        >
          Got it, Let's Play!
        </button>
      </div>
    </div>
  );
};
