import { LevelData } from '../types';
import { levels1to10 } from './levels1to10';
import { levels11to20 } from './levels11to20';
import { levels21to30 } from './levels21to30';
import { levels31to40 } from './levels31to40';
import { levels41to50 } from './levels41to50';

export const ALL_LEVELS: LevelData[] = [
  ...levels1to10,
  ...levels11to20,
  ...levels21to30,
  ...levels31to40,
  ...levels41to50,
];

export function getLevelData(levelNumber: number): LevelData | undefined {
  return ALL_LEVELS.find((l) => l.level === levelNumber);
}

export const MILESTONE_LEVELS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
