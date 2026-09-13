export type Direction = 'across' | 'down';

export interface ClueItem {
  number: number;
  direction: Direction;
  clue: string;
  answer: string; // Uppercase A-Z
  row: number; // 0-indexed row coordinate of starting letter
  col: number; // 0-indexed col coordinate of starting letter
}

export interface MilestoneReward {
  title: string;
  badgeId: string;
  badgeName: string;
  badgeIcon: string;
  bonusCoins: number;
  description: string;
}

export interface LevelData {
  level: number;
  difficulty: string; // "⭐", "⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐⭐", "🔥", "🔥🔥", "🔥🔥🔥"
  tier: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
  gridSize: number; // N for N x N
  theme: string;
  wordCount: number;
  isMilestone: boolean;
  milestoneReward?: MilestoneReward;
  clues: ClueItem[];
}

export interface CellCoord {
  row: number;
  col: number;
}

export interface GridCell {
  row: number;
  col: number;
  letter: string; // Solution letter
  clueNumber?: number;
  acrossClueNumber?: number;
  downClueNumber?: number;
  isBlocked: boolean;
}

export interface LevelProgress {
  completed: boolean;
  completedAt?: string;
  bestTimeSeconds?: number;
  stars: number;
  userInput?: Record<string, string>; // "r,c" -> letter
}

export interface UserStats {
  coins: number;
  unlockedLevel: number;
  completedLevels: number[];
  badges: string[]; // badgeIds
  levelProgress: Record<number, LevelProgress>;
  soundEnabled: boolean;
  adsRemoved?: boolean;
  lastPlayedLevel?: number;
}
