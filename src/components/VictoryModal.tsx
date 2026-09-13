import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, Sparkles, ArrowRight, RotateCcw, CheckCircle2 } from 'lucide-react';
import { AdPlaceholder } from './AdPlaceholder';

interface VictoryModalProps {
  isOpen: boolean;
  levelNumber: number;
  theme: string;
  timeSeconds: number;
  earnedCoins: number;
  adsRemoved?: boolean;
  onOpenRemoveAds?: () => void;
  onNextLevel: () => void;
  onReplay: () => void;
  onClose: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  levelNumber,
  theme,
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
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 },
        zIndex: 9999,
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeSeconds / 60);
  const seconds = timeSeconds % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 text-center shadow-2xl flex flex-col items-center">
        {/* Success Icon */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-2 sm:mb-3">
          <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9" />
        </div>

        <h3 className="text-xl font-bold text-stone-100">Level {levelNumber} Complete!</h3>
        <p className="text-xs text-amber-400 font-medium mt-0.5">{theme}</p>

        {/* Stars */}
        <div className="flex items-center gap-1.5 my-3 sm:my-3.5">
          <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-400 text-amber-400 drop-shadow" />
          <Star className="w-7 h-7 sm:w-8 sm:h-8 fill-amber-400 text-amber-400 drop-shadow scale-110" />
          <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-400 text-amber-400 drop-shadow" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 w-full p-2.5 sm:p-3 rounded-xl bg-stone-850 border border-stone-750 mb-3">
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-medium text-stone-400">Time</span>
            <span className="text-sm font-mono font-bold text-stone-200">{timeFormatted}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-medium text-stone-400">Reward</span>
            <span className="text-sm font-bold text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              +{earnedCoins}
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

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 font-semibold text-xs border border-stone-700 transition cursor-pointer"
          >
            Review
          </button>

          {levelNumber < 50 && (
            <button
              type="button"
              onClick={onNextLevel}
              className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1"
            >
              <span>Next Level</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
