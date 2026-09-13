import React, { useState } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck,
  Check,
  RotateCcw,
  HelpCircle,
  Smartphone,
  Info,
} from 'lucide-react';
import { UserStats } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  onToggleSound: () => void;
  onToggleAdsRemoved: (removed: boolean) => void;
  onOpenHowToPlay: () => void;
  onResetProgress: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  stats,
  onToggleSound,
  onToggleAdsRemoved,
  onOpenHowToPlay,
  onResetProgress,
}) => {
  const [purchaseNotice, setPurchaseNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulatePurchase = () => {
    if (!stats.adsRemoved) {
      onToggleAdsRemoved(true);
      setPurchaseNotice('Premium Ad-Free mode activated! Between-level ad slots are now disabled.');
    } else {
      onToggleAdsRemoved(false);
      setPurchaseNotice('Ad-Free mode deactivated. Between-level ad placeholders restored.');
    }

    setTimeout(() => {
      setPurchaseNotice(null);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <h3 className="text-lg font-bold text-stone-100 flex items-center gap-2">
            Settings & Preferences
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-100 transition cursor-pointer"
            title="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Purchase Status Notice Toast */}
        {purchaseNotice && (
          <div className="py-2 px-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{purchaseNotice}</span>
          </div>
        )}

        {/* 1. Remove Ads Premium Option Placeholder */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-stone-850 via-stone-850 to-amber-950/30 border border-amber-500/40 shadow-sm flex flex-col gap-2.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  Premium Option
                </span>
                {stats.adsRemoved && (
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    Active
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-stone-100 mt-0.5">
                Remove Ads (Ad-Free Experience)
              </h4>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <p className="text-xs text-stone-300 leading-relaxed">
            Eliminates all ad slots between puzzle levels. Keeps all 50 levels completely accessible with clean, uninterrupted transitions.
          </p>

          <div className="pt-1 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSimulatePurchase}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2 ${
                stats.adsRemoved
                  ? 'bg-stone-800 hover:bg-stone-750 text-stone-300 border border-stone-700'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950'
              }`}
            >
              {stats.adsRemoved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Ad-Free Active · Click to Toggle Off</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>$2.99 · Remove Ads (Placeholder)</span>
                </>
              )}
            </button>
          </div>

          <div className="text-[10px] text-stone-400 flex items-center gap-1">
            <Info className="w-3 h-3 text-stone-400 shrink-0" />
            <span>Monetization placeholder · Ready for Google Play / App Store In-App Purchases</span>
          </div>
        </div>

        {/* 2. Audio Setting */}
        <div className="p-3 rounded-2xl bg-stone-850 border border-stone-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-stone-800 text-stone-300 flex items-center justify-center">
              {stats.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-stone-400" />
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-stone-200">Sound Effects</div>
              <div className="text-[11px] text-stone-400">
                Key clicks, word chimes, and victory fanfares
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleSound}
            className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition cursor-pointer border ${
              stats.soundEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-stone-800 text-stone-400 border-stone-750'
            }`}
          >
            {stats.soundEnabled ? 'Enabled' : 'Muted'}
          </button>
        </div>

        {/* 3. Game Guidance & Info */}
        <div className="flex flex-col gap-1 text-xs">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenHowToPlay();
            }}
            className="w-full p-2.5 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-300 hover:text-stone-100 border border-stone-800 flex items-center justify-between transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>How to Play & Controls</span>
            </div>
            <span className="text-stone-500 font-mono text-[11px]">→</span>
          </button>

          <button
            type="button"
            onClick={onResetProgress}
            className="w-full p-2.5 rounded-xl bg-stone-850 hover:bg-rose-950/30 text-stone-400 hover:text-rose-300 border border-stone-800 hover:border-rose-900/40 flex items-center justify-between transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              <span>Reset Game Progress</span>
            </div>
            <span className="text-stone-500 font-mono text-[11px]">Reset</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-stone-800 text-center text-[11px] text-stone-400">
          Crossword Quest · 50 Progressive Levels · 100% Free to Play
        </div>
      </div>
    </div>
  );
};
