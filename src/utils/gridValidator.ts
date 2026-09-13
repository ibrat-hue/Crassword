import { ClueItem, GridCell, LevelData } from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateLevelData(level: LevelData): ValidationResult {
  const errors: string[] = [];
  const grid: (string | null)[][] = Array.from({ length: level.gridSize }, () =>
    Array(level.gridSize).fill(null)
  );

  for (const clue of level.clues) {
    const { answer, direction, row, col } = clue;
    const len = answer.length;

    if (row < 0 || row >= level.gridSize || col < 0 || col >= level.gridSize) {
      errors.push(`Level ${level.level}: Clue ${clue.number} ${direction} (${answer}) starts out of bounds at (${row}, ${col})`);
      continue;
    }

    if (direction === 'across' && col + len > level.gridSize) {
      errors.push(`Level ${level.level}: Clue ${clue.number} across (${answer}) extends beyond grid width (${col + len} > ${level.gridSize})`);
    }

    if (direction === 'down' && row + len > level.gridSize) {
      errors.push(`Level ${level.level}: Clue ${clue.number} down (${answer}) extends beyond grid height (${row + len} > ${level.gridSize})`);
    }

    for (let i = 0; i < len; i++) {
      const r = direction === 'across' ? row : row + i;
      const c = direction === 'across' ? col + i : col;
      const letter = answer[i].toUpperCase();

      if (r < level.gridSize && c < level.gridSize) {
        const existing = grid[r][c];
        if (existing && existing !== letter) {
          errors.push(
            `Level ${level.level}: Conflict at (${r}, ${c}): '${existing}' vs '${letter}' (from ${clue.number} ${direction} "${answer}")`
          );
        } else {
          grid[r][c] = letter;
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Builds the full grid matrix for a level, attaching clue numbers and letters
 */
export function buildGridMatrix(level: LevelData): GridCell[][] {
  const matrix: GridCell[][] = Array.from({ length: level.gridSize }, (_, r) =>
    Array.from({ length: level.gridSize }, (_, c) => ({
      row: r,
      col: c,
      letter: '',
      isBlocked: true,
    }))
  );

  // Mark letters and clue associations
  for (const clue of level.clues) {
    const len = clue.answer.length;
    for (let i = 0; i < len; i++) {
      const r = clue.direction === 'across' ? clue.row : clue.row + i;
      const c = clue.direction === 'across' ? clue.col + i : clue.col;
      if (r < level.gridSize && c < level.gridSize) {
        matrix[r][c].letter = clue.answer[i].toUpperCase();
        matrix[r][c].isBlocked = false;
        if (clue.direction === 'across') {
          matrix[r][c].acrossClueNumber = clue.number;
        } else {
          matrix[r][c].downClueNumber = clue.number;
        }
      }
    }
  }

  // Assign clue display numbers to start positions
  for (const clue of level.clues) {
    if (clue.row < level.gridSize && clue.col < level.gridSize) {
      matrix[clue.row][clue.col].clueNumber = clue.number;
    }
  }

  return matrix;
}
