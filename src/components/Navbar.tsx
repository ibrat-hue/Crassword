import React from 'react';
import { Trophy, Volume2, VolumeX, Sparkles, Map, BookOpen, Star, HelpCircle, Settings, ShieldCheck } from 'lucide-react';
import { UserStats, LevelProgress } from '../types';

interface NavbarProps {
  currentLevel: number;
  totalLevels: number;
  stats: UserStats;
  onToggleSound: () => void;
  onOpenLevelSelector: () => void;
  onOpenBadges: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLevel,
  totalLevels,
  stats,
  onToggleSound,
  onOpenLevelSelector,
  onOpenBadges,
  onOpenHowToPlay,
  onOpenSettings,
}) => {
  const totalStars = Object.values(stats.levelProgress).reduce(
    (acc: number, curr: LevelProgress) => acc + (curr.completed ? curr.stars : 0),
    0
  );

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur border-b border-stone-800 text-stone-100 px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand & Level Select button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenLevelSelector}
            className="flex items-center gap-2 group text-left px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700/80 border border-stone-700 transition cursor-pointer"
            title="Open 50-Level Quest Map"
          >
            <div className="w-7 h-7 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
              <Map className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-medium tracking-wide uppercase text-amber-400/90 leading-none">
                Quest Map
              </div>
              <div className="text-sm font-bold text-stone-100 flex items-center gap-1 leading-tight">
                Level {currentLevel} <span className="text-stone-400 text-xs font-normal">/ {totalLevels}</span>
              </div>
            </div>
          </button>
        </div>

        {/* Center Title for larger viewports */}
        <div className="hidden sm:flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <h1 className="font-bold text-base tracking-tight text-stone-100">
            Crossword <span className="text-amber-400">Quest</span>
          </h1>
          <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            50 Levels
          </span>
          {stats.adsRemoved && (
            <span
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold cursor-pointer hover:bg-emerald-500/25 transition"
              title="Ad-Free Premium Active"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Ad-Free</span>
            </span>
          )}
        </div>

        {/* Stats and Action Bar */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Coins */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold"
            title="Your Adventure Coins"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{stats.coins}</span>
          </div>

          {/* Stars */}
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-800 border border-stone-700 text-stone-200 text-xs font-semibold"
            title="Stars Earned"
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{totalStars}</span>
          </div>

          {/* Milestone Trophies / Badges */}
          <button
            onClick={onOpenBadges}
            className="relative p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-amber-400 transition cursor-pointer border border-stone-700"
            title="Milestone Badges & Trophies"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            {stats.badges.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold flex items-center justify-center">
                {stats.badges.length}
              </span>
            )}
          </button>

          {/* Settings / Preferences (including Remove Ads) */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-400 transition cursor-pointer border border-stone-700"
            title="Settings & Remove Ads"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
