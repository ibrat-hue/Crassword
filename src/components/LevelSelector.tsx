import React, { useState } from 'react';
import { X, Lock, CheckCircle2, Star, Sparkles, Trophy, Flame } from 'lucide-react';
import { LevelData, UserStats } from '../types';
import { ALL_LEVELS } from '../data';

interface LevelSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: number;
  onSelectLevel: (levelNum: number) => void;
  stats: UserStats;
}

type FilterTier = 'all' | 'milestones' | 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  isOpen,
  onClose,
  currentLevel,
  onSelectLevel,
  stats,
}) => {
  const [tierFilter, setTierFilter] = useState<FilterTier>('all');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredLevels = ALL_LEVELS.filter((lvl) => {
    if (tierFilter === 'milestones' && !lvl.isMilestone) return false;
    if (tierFilter !== 'all' && tierFilter !== 'milestones' && lvl.tier !== tierFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        lvl.level.toString().includes(q) ||
        lvl.theme.toLowerCase().includes(q) ||
        lvl.difficulty.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-stone-100">Crossword Progression Map</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                50 Levels
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Select any unlocked stage. Every 5th level is a special Milestone Challenge!
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters & Search */}
        <div className="p-4 border-b border-stone-800/80 bg-stone-900/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {(
              [
                { id: 'all', label: 'All (50)' },
                { id: 'milestones', label: '⭐ Milestones (10)' },
                { id: 'beginner', label: 'Beginner 1-10' },
                { id: 'intermediate', label: 'Intermediate 11-25' },
                { id: 'advanced', label: 'Advanced 26-36' },
                { id: 'expert', label: 'Expert 37-45' },
                { id: 'master', label: 'Master 46-50' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTierFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  tierFilter === tab.id
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-stone-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search theme or level..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-stone-800 border border-stone-700 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 w-full sm:w-48"
          />
        </div>

        {/* Levels Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {filteredLevels.map((lvl) => {
            const isUnlocked = lvl.level <= stats.unlockedLevel;
            const progress = stats.levelProgress[lvl.level];
            const isCompleted = progress?.completed;
            const isCurrent = lvl.level === currentLevel;

            return (
              <button
                key={lvl.level}
                disabled={!isUnlocked}
                onClick={() => {
                  onSelectLevel(lvl.level);
                  onClose();
                }}
                className={`relative group flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  !isUnlocked
                    ? 'opacity-40 bg-stone-950/40 border-stone-800/60 cursor-not-allowed'
                    : isCurrent
                    ? 'bg-amber-500/15 border-amber-500 shadow-md ring-2 ring-amber-500/30'
                    : lvl.isMilestone
                    ? 'bg-gradient-to-b from-amber-950/30 to-stone-900 border-amber-500/40 hover:border-amber-400 hover:shadow-lg'
                    : 'bg-stone-800/70 border-stone-700 hover:border-stone-500 hover:bg-stone-800'
                }`}
              >
                {/* Milestone Badge Overlay */}
                {lvl.isMilestone && (
                  <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 text-[10px] font-extrabold tracking-wider flex items-center gap-1 shadow-sm uppercase">
                    <Trophy className="w-2.5 h-2.5" />
                    Milestone
                  </div>
                )}

                {/* Top Row: Level & Status */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-stone-300">
                    Level {lvl.level}
                  </span>
                  <div>
                    {!isUnlocked ? (
                      <Lock className="w-3.5 h-3.5 text-stone-500" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <span className="text-[10px] font-medium text-amber-400/80">Play</span>
                    )}
                  </div>
                </div>

                {/* Theme Name */}
                <div className="text-sm font-semibold text-stone-100 truncate mb-1" title={lvl.theme}>
                  {lvl.theme}
                </div>

                {/* Grid & Word Count Info */}
                <div className="text-[11px] text-stone-400 flex items-center justify-between mb-2">
                  <span>{lvl.gridSize}×{lvl.gridSize} grid</span>
                  <span>{lvl.clues.length} words</span>
                </div>

                {/* Bottom Row: Stars & Difficulty */}
                <div className="mt-auto pt-2 border-t border-stone-700/50 flex items-center justify-between">
                  <div className="flex items-center text-amber-400 text-xs">
                    {lvl.difficulty}
                  </div>
                  {isCompleted && (
                    <div className="flex items-center gap-0.5 text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <Star className="w-3 h-3 fill-amber-400" />
                      <Star className="w-3 h-3 fill-amber-400" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
