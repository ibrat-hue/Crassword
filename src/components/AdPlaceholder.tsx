import React from 'react';
import { ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';

interface AdPlaceholderProps {
  adsRemoved?: boolean;
  onOpenRemoveAds?: () => void;
  className?: string;
  variant?: 'banner' | 'modal';
}

export const AdPlaceholder: React.FC<AdPlaceholderProps> = ({
  adsRemoved = false,
  onOpenRemoveAds,
  className = '',
  variant = 'modal',
}) => {
  // If user purchased Remove Ads, ads are completely suppressed
  if (adsRemoved) {
    return (
      <div className={`w-full py-2 px-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-center gap-1.5 ${className}`}>
        <ShieldCheck className="w-3.5 h-3.5" />
        <span className="font-semibold">Ad-Free Experience Active</span>
      </div>
    );
  }

  return (
    <div
      className={`w-full rounded-2xl bg-stone-950/70 border border-dashed border-stone-700/80 p-3 sm:p-3.5 text-center flex flex-col items-center justify-center transition-all ${className}`}
      aria-label="Ad Placeholder"
    >
      {/* Label and Badge */}
      <div className="w-full flex items-center justify-between pb-1.5 mb-1.5 border-b border-stone-800/80 text-[10px] text-stone-400">
        <span className="uppercase tracking-wider font-semibold text-stone-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-stone-500 inline-block" />
          Ad Placeholder
        </span>
        <span className="font-mono text-stone-400">Between-Levels Slot</span>
      </div>

      {/* Placeholder Display Box */}
      <div className="w-full min-h-[58px] sm:min-h-[68px] rounded-xl bg-stone-900/60 border border-stone-800 flex flex-col items-center justify-center px-3 py-2 text-stone-400">
        <p className="text-xs font-medium text-stone-300">
          Reserved Ad Space (320×100 Banner)
        </p>
        <p className="text-[11px] text-stone-400 mt-0.5">
          Ad network integration placeholder · Ready for Google AdMob or Web Ads SDK
        </p>
      </div>

      {/* Remove Ads Quick Link */}
      {onOpenRemoveAds && (
        <div className="mt-2 w-full flex items-center justify-end">
          <button
            type="button"
            onClick={onOpenRemoveAds}
            className="text-[11px] text-amber-400/90 hover:text-amber-300 font-medium flex items-center gap-1 transition cursor-pointer hover:underline"
          >
            <Sparkles className="w-3 h-3" />
            <span>Remove Ads option in Settings</span>
          </button>
        </div>
      )}
    </div>
  );
};
