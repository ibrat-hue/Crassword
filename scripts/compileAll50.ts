import fs from 'fs';
import path from 'path';
import { compileBlueprint } from './generateAll50';
import { themesData } from './wordbanks';
import { themes11to25 } from './wordbanks_11to25';
import { themes26to40 } from './wordbanks_26to40';
import { themes41to50 } from './wordbanks_41to50';
import { LevelData } from '../src/types';

const allThemes = [
  ...themesData,
  ...themes11to25,
  ...themes26to40,
  ...themes41to50,
];

console.log(`Starting compilation of ${allThemes.length} crossword levels...`);

const compiledLevels: LevelData[] = [];

for (const theme of allThemes) {
  const start = Date.now();
  const compiled = compileBlueprint(theme);
  const elapsed = Date.now() - start;
  compiledLevels.push(compiled);
  console.log(
    `✅ Level ${compiled.level.toString().padStart(2, ' ')} (${compiled.theme}): ` +
    `Grid ${compiled.gridSize}x${compiled.gridSize}, ${compiled.wordCount} words, in ${elapsed}ms`
  );
}

// Partition into files
function serializeLevels(levels: LevelData[]): string {
  return `import { LevelData } from '../types';\n\nexport const levels: LevelData[] = ${JSON.stringify(
    levels,
    null,
    2
  )};\n`;
}

const p1to10 = compiledLevels.slice(0, 10);
const p11to20 = compiledLevels.slice(10, 20);
const p21to30 = compiledLevels.slice(20, 30);
const p31to40 = compiledLevels.slice(30, 40);
const p41to50 = compiledLevels.slice(40, 50);

fs.writeFileSync(
  path.join(process.cwd(), 'src/data/levels1to10.ts'),
  serializeLevels(p1to10).replace('export const levels:', 'export const levels1to10:')
);
fs.writeFileSync(
  path.join(process.cwd(), 'src/data/levels11to20.ts'),
  serializeLevels(p11to20).replace('export const levels:', 'export const levels11to20:')
);
fs.writeFileSync(
  path.join(process.cwd(), 'src/data/levels21to30.ts'),
  serializeLevels(p21to30).replace('export const levels:', 'export const levels21to30:')
);
fs.writeFileSync(
  path.join(process.cwd(), 'src/data/levels31to40.ts'),
  serializeLevels(p31to40).replace('export const levels:', 'export const levels31to40:')
);
fs.writeFileSync(
  path.join(process.cwd(), 'src/data/levels41to50.ts'),
  serializeLevels(p41to50).replace('export const levels:', 'export const levels41to50:')
);

// Create index.ts
const indexContent = `import { LevelData } from '../types';
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
`;

fs.writeFileSync(path.join(process.cwd(), 'src/data/index.ts'), indexContent);

console.log('🎉 Successfully generated all 50 crossword levels and saved to src/data/!');
