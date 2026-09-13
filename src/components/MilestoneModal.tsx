import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, ArrowRight, RotateCcw, Award } from 'lucide-react';
import { MilestoneReward } from '../types';
import { AdPlaceholder } from './AdPlaceholder';

interface MilestoneModalProps {
  isOpen: boolean;
  levelNumber: number;
  theme: string;
  milestoneReward?: MilestoneReward;
  timeSeconds: number;
  earnedCoins: number;
  adsRemoved?: boolean;
  onOpenRemoveAds?: () => void;
  onNextLevel: () => void;
  onReplay: () => void;
  onClose: () => void;
}

export const MilestoneModal: React.FC<MilestoneModalProps> = ({
  isOpen,
  levelNumber,
  theme,
  milestoneReward,
  timeSeconds,
  earnedCoins,
  adsRemoved = false,
  onOpenRemoveAds,
  onNextLevel,
  onReplay,
  onClose,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Trigger magnificent milestone confetti
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999,
      };

      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeSeconds / 60);
  const seconds = timeSeconds % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-gradient-to-b from-stone-900 via-stone-900 to-amber-950/40 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col items-center">
        {/* Milestone Crown Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 font-black text-xs uppercase tracking-wider mb-4 shadow-md">
          <Trophy className="w-3.5 h-3.5" />
          Milestone Challenge Conquered!
        </div>

        {/* Badge Icon */}
        <div className="relative my-2">
          <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl animate-pulse" />
          <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 p-1 shadow-2xl flex items-center justify-center">
            <div className="w-full h-full rounded-xl bg-stone-950/90 flex flex-col items-center justify-center text-4xl">
              <span>{milestoneReward?.badgeIcon || '🏆'}</span>
            </div>
          </div>
        </div>

        {/* Badge Title & Description */}
        <h3 className="text-2xl font-black text-stone-100 mt-3 tracking-tight">
          {milestoneReward?.badgeName || `Level ${levelNumber} Master`}
        </h3>
        <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mt-1">
          {milestoneReward?.title || 'Milestone Champion'}
        </p>

        <p className="text-xs text-stone-300 mt-2 max-w-xs leading-relaxed">
          {milestoneReward?.description ||
            `Congratulations on solving the Level ${levelNumber} Milestone challenge (${theme})!`}
        </p>

        {/* Stats strip */}
        <div className="grid grid-cols-2 gap-3 w-full my-4 p-3 rounded-xl bg-stone-800/80 border border-stone-700/80">
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-medium text-stone-400">Solve Time</span>
            <span className="text-sm font-mono font-bold text-stone-200">{timeFormatted}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-medium text-stone-400">Milestone Bounty</span>
            <span className="text-sm font-bold text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              +{earnedCoins} Coins
            </span>
          </div>
        </div>

        {/* Between-Levels Ad Placeholder Area */}
        <div className="w-full mb-3">
          <AdPlaceholder
            adsRemoved={adsRemoved}
            onOpenRemoveAds={onOpenRemoveAds}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5 w-full mt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 font-semibold text-xs border border-stone-700 transition cursor-pointer"
          >
            Review Board
          </button>

          {levelNumber < 50 && (
            <button
              type="button"
              onClick={onNextLevel}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-bold text-xs shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Next Level</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
