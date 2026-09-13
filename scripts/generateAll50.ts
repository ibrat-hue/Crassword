import fs from 'fs';
import path from 'path';
import { ClueItem, LevelData, MilestoneReward } from '../src/types';
import { validateLevelData } from '../src/utils/gridValidator';

interface WordDef {
  word: string;
  clue: string;
}

interface LevelBlueprint {
  level: number;
  difficulty: string;
  tier: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
  gridSize: number;
  theme: string;
  wordCount: number;
  isMilestone: boolean;
  milestoneReward?: MilestoneReward;
  words: WordDef[];
}

interface PlacedWord {
  word: string;
  clue: string;
  direction: 'across' | 'down';
  row: number;
  col: number;
}

function canPlace(
  grid: (string | null)[][],
  gridSize: number,
  word: string,
  dir: 'across' | 'down',
  row: number,
  col: number
): { valid: boolean; intersections: number } {
  const len = word.length;
  if (dir === 'across') {
    if (col + len > gridSize) return { valid: false, intersections: 0 };
    if (col > 0 && grid[row][col - 1] !== null) return { valid: false, intersections: 0 };
    if (col + len < gridSize && grid[row][col + len] !== null) return { valid: false, intersections: 0 };
  } else {
    if (row + len > gridSize) return { valid: false, intersections: 0 };
    if (row > 0 && grid[row - 1][col] !== null) return { valid: false, intersections: 0 };
    if (row + len < gridSize && grid[row + len][col] !== null) return { valid: false, intersections: 0 };
  }

  let intersections = 0;

  for (let i = 0; i < len; i++) {
    const r = dir === 'across' ? row : row + i;
    const c = dir === 'across' ? col + i : col;
    const existing = grid[r][c];

    if (existing !== null) {
      if (existing !== word[i]) {
        return { valid: false, intersections: 0 };
      }
      intersections++;
    } else {
      if (dir === 'across') {
        const up = r > 0 ? grid[r - 1][c] : null;
        const down = r < gridSize - 1 ? grid[r + 1][c] : null;
        if (up !== null || down !== null) {
          return { valid: false, intersections: 0 };
        }
      } else {
        const left = c > 0 ? grid[r][c - 1] : null;
        const right = c < gridSize - 1 ? grid[r][c + 1] : null;
        if (left !== null || right !== null) {
          return { valid: false, intersections: 0 };
        }
      }
    }
  }

  return { valid: true, intersections };
}

function generateLevelGrid(
  blueprint: LevelBlueprint
): PlacedWord[] | null {
  const { words, gridSize, wordCount } = blueprint;
  const validWords = words
    .map(w => ({ word: w.word.toUpperCase().replace(/[^A-Z]/g, ''), clue: w.clue }))
    .filter(w => w.word.length >= 3 && w.word.length <= gridSize);

  // Cap start target to realistic crossword density for given grid size
  const targetMax = Math.min(wordCount, Math.max(6, Math.floor(gridSize * 1.35)));
  const minCount = Math.max(4, Math.floor(targetMax * 0.65));

  for (let target = targetMax; target >= minCount; target--) {
    const attempts = target >= targetMax - 1 ? 800 : 400;
    for (let restart = 0; restart < attempts; restart++) {
      const shuffled = [...validWords].sort(() => Math.random() - 0.5);
      const grid: (string | null)[][] = Array.from({ length: gridSize }, () =>
        Array(gridSize).fill(null)
      );
      const placed: PlacedWord[] = [];
      const used = new Set<string>();

      const first = shuffled[0];
      if (!first) continue;
      const firstDir: 'across' | 'down' = Math.random() > 0.5 ? 'across' : 'down';
      
      let firstRow = 0;
      let firstCol = 0;
      if (firstDir === 'across') {
        firstRow = Math.max(0, Math.min(gridSize - 1, Math.floor(gridSize / 2) + Math.floor(Math.random() * 3) - 1));
        firstCol = Math.max(0, Math.min(gridSize - first.word.length, Math.floor((gridSize - first.word.length) / 2)));
      } else {
        firstRow = Math.max(0, Math.min(gridSize - first.word.length, Math.floor((gridSize - first.word.length) / 2)));
        firstCol = Math.max(0, Math.min(gridSize - 1, Math.floor(gridSize / 2) + Math.floor(Math.random() * 3) - 1));
      }

      for (let i = 0; i < first.word.length; i++) {
        const r = firstDir === 'across' ? firstRow : firstRow + i;
        const c = firstDir === 'across' ? firstCol + i : firstCol;
        grid[r][c] = first.word[i];
      }
      placed.push({
        word: first.word,
        clue: first.clue,
        direction: firstDir,
        row: firstRow,
        col: firstCol,
      });
      used.add(first.word);

      let progress = true;
      while (placed.length < target && progress) {
        progress = false;
        const candidates: {
          word: WordDef;
          dir: 'across' | 'down';
          row: number;
          col: number;
          intersections: number;
        }[] = [];

        for (const w of shuffled) {
          if (used.has(w.word)) continue;
          const len = w.word.length;

          // Find placements by intersecting with existing letters in the grid
          for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
              const ch = grid[r][c];
              if (!ch) continue;

              for (let i = 0; i < len; i++) {
                if (w.word[i] !== ch) continue;

                // Try across: word spans from c - i to c - i + len - 1 at row r
                const aCol = c - i;
                if (aCol >= 0 && aCol + len <= gridSize) {
                  const check = canPlace(grid, gridSize, w.word, 'across', r, aCol);
                  if (check.valid && check.intersections >= 1) {
                    candidates.push({
                      word: w,
                      dir: 'across',
                      row: r,
                      col: aCol,
                      intersections: check.intersections,
                    });
                  }
                }

                // Try down: word spans from r - i to r - i + len - 1 at col c
                const dRow = r - i;
                if (dRow >= 0 && dRow + len <= gridSize) {
                  const check = canPlace(grid, gridSize, w.word, 'down', dRow, c);
                  if (check.valid && check.intersections >= 1) {
                    candidates.push({
                      word: w,
                      dir: 'down',
                      row: dRow,
                      col: c,
                      intersections: check.intersections,
                    });
                  }
                }
              }
              if (candidates.length >= 25) break;
            }
            if (candidates.length >= 25) break;
          }
          if (candidates.length >= 25) break;
        }

        if (candidates.length > 0) {
          candidates.sort((a, b) => b.intersections - a.intersections + (Math.random() - 0.5));
          const pick = candidates[0];

          for (let i = 0; i < pick.word.word.length; i++) {
            const r = pick.dir === 'across' ? pick.row : pick.row + i;
            const c = pick.dir === 'across' ? pick.col + i : pick.col;
            grid[r][c] = pick.word.word[i];
          }

          placed.push({
            word: pick.word.word,
            clue: pick.word.clue,
            direction: pick.dir,
            row: pick.row,
            col: pick.col,
          });
          used.add(pick.word.word);
          progress = true;
        }
      }

      if (placed.length >= target) {
        return placed.slice(0, target);
      }
    }
  }

  return null;
}

export function compileBlueprint(bp: LevelBlueprint): LevelData {
  const placed = generateLevelGrid(bp);
  if (!placed) {
    throw new Error(`Failed to compile level ${bp.level} (${bp.theme})`);
  }

  const sortedStarts: { row: number; col: number }[] = [];
  for (const p of placed) {
    if (!sortedStarts.some(s => s.row === p.row && s.col === p.col)) {
      sortedStarts.push({ row: p.row, col: p.col });
    }
  }
  sortedStarts.sort((a, b) => (a.row === b.row ? a.col - b.col : a.row - b.row));

  const cellNumbers = new Map<string, number>();
  let nextNum = 1;
  for (const s of sortedStarts) {
    cellNumbers.set(`${s.row},${s.col}`, nextNum++);
  }

  const clues: ClueItem[] = placed.map(p => ({
    number: cellNumbers.get(`${p.row},${p.col}`) || 1,
    direction: p.direction,
    clue: p.clue,
    answer: p.word.toUpperCase(),
    row: p.row,
    col: p.col,
  }));

  clues.sort((a, b) =>
    a.number === b.number
      ? a.direction === 'across'
        ? -1
        : 1
      : a.number - b.number
  );

  const data: LevelData = {
    level: bp.level,
    difficulty: bp.difficulty,
    tier: bp.tier,
    gridSize: bp.gridSize,
    theme: bp.theme,
    wordCount: clues.length,
    isMilestone: bp.isMilestone,
    milestoneReward: bp.milestoneReward,
    clues,
  };

  const val = validateLevelData(data);
  if (!val.valid) {
    throw new Error(`Level ${bp.level} validation error: ` + val.errors.join('; '));
  }

  return data;
}
