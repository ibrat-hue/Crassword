interface WordDef {
  word: string;
  clue: string;
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
    // Check cell before and after
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
      // Empty cell - check parallel neighbors
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

export function generateGrid(
  words: WordDef[],
  gridSize: number,
  targetCount: number,
  maxRestarts = 2000
): PlacedWord[] | null {
  for (let restart = 0; restart < maxRestarts; restart++) {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    const grid: (string | null)[][] = Array.from({ length: gridSize }, () =>
      Array(gridSize).fill(null)
    );
    const placed: PlacedWord[] = [];
    const used = new Set<string>();

    // First word placed horizontally near top-left or center
    const first = shuffled[0];
    if (!first || first.word.length > gridSize) continue;
    const firstRow = Math.floor(Math.random() * Math.min(3, Math.max(1, gridSize - 2)));
    const firstCol = Math.floor(Math.random() * Math.max(1, gridSize - first.word.length));

    for (let i = 0; i < first.word.length; i++) {
      grid[firstRow][firstCol + i] = first.word[i];
    }
    placed.push({
      word: first.word,
      clue: first.clue,
      direction: 'across',
      row: firstRow,
      col: firstCol,
    });
    used.add(first.word);

    let progress = true;
    while (placed.length < targetCount && progress) {
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

        // Try both directions
        const dirs: ('across' | 'down')[] = ['across', 'down'];
        for (const dir of dirs) {
          const maxR = dir === 'down' ? gridSize - len : gridSize - 1;
          const maxC = dir === 'across' ? gridSize - len : gridSize - 1;

          for (let r = 0; r <= maxR; r++) {
            for (let c = 0; c <= maxC; c++) {
              const check = canPlace(grid, gridSize, w.word, dir, r, c);
              if (check.valid && check.intersections >= 1) {
                candidates.push({
                  word: w,
                  dir,
                  row: r,
                  col: c,
                  intersections: check.intersections,
                });
              }
            }
          }
        }
      }

      if (candidates.length > 0) {
        // Prefer more intersections
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

    if (placed.length >= targetCount) {
      return placed.slice(0, targetCount);
    }
  }

  return null;
}

// Test with 5x5 everyday words
const sampleWords: WordDef[] = [
  { word: 'HOME', clue: 'Where the heart is' },
  { word: 'OVEN', clue: 'Appliance for baking' },
  { word: 'NEST', clue: 'Bird house of twigs' },
  { word: 'DOOR', clue: 'Entryway barrier' },
  { word: 'ROOM', clue: 'Enclosed interior space' },
  { word: 'ROOF', clue: 'Top shelter of a house' },
  { word: 'LAMP', clue: 'Table light source' },
  { word: 'RUG', clue: 'Floor carpet covering' },
  { word: 'BED', clue: 'Piece of furniture for sleep' },
  { word: 'DESK', clue: 'Study table' },
  { word: 'SOFA', clue: 'Living room couch' },
  { word: 'KEY', clue: 'Metal tool for locks' },
  { word: 'PAN', clue: 'Shallow cooking vessel' },
  { word: 'POT', clue: 'Deep cooking vessel' },
  { word: 'CUP', clue: 'Drinking vessel' },
  { word: 'MUG', clue: 'Heavy cup for coffee' },
  { word: 'TEA', clue: 'Brewed herbal beverage' },
  { word: 'WALL', clue: 'Vertical barrier in a room' },
];

console.time('Generate 5x5');
const res = generateGrid(sampleWords, 5, 5);
console.timeEnd('Generate 5x5');
console.log('Result found:', res ? res.length + ' words' : 'null');
if (res) console.log(res);
