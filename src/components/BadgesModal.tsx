import React from 'react';
import { X, Trophy, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { ALL_LEVELS } from '../data';
import { UserStats } from '../types';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
}

export const BadgesModal: React.FC<BadgesModalProps> = ({
  isOpen,
  onClose,
  stats,
}) => {
  if (!isOpen) return null;

  const milestoneLevels = ALL_LEVELS.filter((l) => l.isMilestone && l.milestoneReward);
  const earnedCount = stats.badges.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[88vh] bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
                Milestone Trophy Hall
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                  {earnedCount} / 10 Earned
                </span>
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Every 5th level rewards a unique collector badge and bonus bounty!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Badges Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 custom-scrollbar">
          {milestoneLevels.map((lvl) => {
            const reward = lvl.milestoneReward!;
            const isEarned = stats.badges.includes(reward.badgeId);

            return (
              <div
                key={reward.badgeId}
                className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                  isEarned
                    ? 'bg-gradient-to-br from-amber-950/30 via-stone-850 to-stone-900 border-amber-500/50 shadow-md'
                    : 'bg-stone-850/50 border-stone-800/80 opacity-60'
                }`}
              >
                {/* Badge Icon */}
                <div
                  className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-2xl border shadow-inner ${
                    isEarned
                      ? 'bg-gradient-to-br from-amber-500 to-yellow-600 border-amber-300/40 text-stone-950'
                      : 'bg-stone-800 border-stone-700 text-stone-500'
                  }`}
                >
                  {isEarned ? reward.badgeIcon : <Lock className="w-5 h-5" />}
                </div>

                {/* Badge Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      Level {lvl.level}
                    </span>
                    {isEarned && (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Unlocked
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-stone-100 truncate">
                    {reward.badgeName}
                  </h4>
                  <p className="text-xs text-stone-300 line-clamp-2 mt-0.5 leading-relaxed">
                    {reward.description}
                  </p>
                  <div className="text-[10px] text-amber-400/90 font-medium mt-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    +{reward.bonusCoins} Bonus Coins
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
