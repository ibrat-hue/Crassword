import { UserStats, LevelProgress } from '../types';

const STORAGE_KEY = 'crossword_quest_user_stats_v2';

export const INITIAL_USER_STATS: UserStats = {
  coins: 100,
  unlockedLevel: 1,
  completedLevels: [],
  badges: [],
  levelProgress: {},
  soundEnabled: true,
  adsRemoved: false,
};

export function loadUserStats(): UserStats {
  if (typeof window === 'undefined') return INITIAL_USER_STATS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_USER_STATS;
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_USER_STATS,
      ...parsed,
      levelProgress: parsed.levelProgress || {},
    };
  } catch {
    return INITIAL_USER_STATS;
  }
}

export function saveUserStats(stats: UserStats) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save user stats', err);
  }
}

export function saveLastPlayedLevel(levelNum: number) {
  const current = loadUserStats();
  if (current.lastPlayedLevel !== levelNum) {
    const updated = { ...current, lastPlayedLevel: levelNum };
    saveUserStats(updated);
  }
}

export function recordLevelCompletion(
  levelNum: number,
  timeSeconds: number,
  isMilestone: boolean,
  milestoneBadgeId?: string,
  bonusCoins = 50,
  completedUserInput?: Record<string, string>
): { stats: UserStats; earnedCoins: number; newlyUnlockedBadge: boolean } {
  const current = loadUserStats();
  const prevProgress = current.levelProgress[levelNum];
  const isFirstCompletion = !current.completedLevels.includes(levelNum);

  const baseCoins = 25;
  const earnedCoins = isFirstCompletion ? baseCoins + (isMilestone ? bonusCoins : 0) : 10;
  let newlyUnlockedBadge = false;

  const newCompleted = isFirstCompletion
    ? [...current.completedLevels, levelNum].sort((a, b) => a - b)
    : current.completedLevels;

  const newUnlocked = Math.max(current.unlockedLevel, Math.min(50, levelNum + 1));

  const badges = [...current.badges];
  if (milestoneBadgeId && !badges.includes(milestoneBadgeId)) {
    badges.push(milestoneBadgeId);
    newlyUnlockedBadge = true;
  }

  const newProgress: LevelProgress = {
    completed: true,
    completedAt: new Date().toISOString(),
    bestTimeSeconds: prevProgress?.bestTimeSeconds
      ? Math.min(prevProgress.bestTimeSeconds, timeSeconds)
      : timeSeconds,
    stars: 3,
    userInput: completedUserInput || prevProgress?.userInput,
  };

  const updated: UserStats = {
    ...current,
    coins: current.coins + earnedCoins,
    completedLevels: newCompleted,
    unlockedLevel: newUnlocked,
    lastPlayedLevel: levelNum,
    badges,
    levelProgress: {
      ...current.levelProgress,
      [levelNum]: newProgress,
    },
  };

  saveUserStats(updated);
  return { stats: updated, earnedCoins, newlyUnlockedBadge };
}
