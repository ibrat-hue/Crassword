import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ALL_LEVELS, getLevelData } from './data';
import { Direction, GridCell, ClueItem, UserStats } from './types';
import { Navbar } from './components/Navbar';
import { CrosswordGrid } from './components/CrosswordGrid';
import { CluesPanel } from './components/CluesPanel';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { LevelSelector } from './components/LevelSelector';
import { MilestoneModal } from './components/MilestoneModal';
import { VictoryModal } from './components/VictoryModal';
import { BadgesModal } from './components/BadgesModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';
import {
  loadUserStats,
  saveUserStats,
  recordLevelCompletion,
  saveLastPlayedLevel,
} from './utils/storage';
import {
  playKeySound,
  playWordCompleteSound,
  playVictorySound,
  playHintSound,
} from './utils/audio';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  CheckSquare,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Timer,
  Info,
} from 'lucide-react';

export default function App() {
  const [stats, setStats] = useState<UserStats>(loadUserStats);
  const [currentLevelNumber, setCurrentLevelNumber] = useState<number>(() => {
    return Math.min(50, stats.lastPlayedLevel || stats.unlockedLevel || 1);
  });

  const level = useMemo(() => {
    return getLevelData(currentLevelNumber) || ALL_LEVELS[0];
  }, [currentLevelNumber]);

  const [direction, setDirection] = useState<Direction>('across');
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [userInput, setUserInput] = useState<Record<string, string>>({});
  const [errorCells, setErrorCells] = useState<Set<string>>(new Set());
  const [checkFeedback, setCheckFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isLevelSolved, setIsLevelSolved] = useState(false);

  // Modals
  const [isLevelSelectorOpen, setIsLevelSelectorOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lastEarnedCoins, setLastEarnedCoins] = useState(0);

  // Build grid data structure
  const gridCells = useMemo(() => {
    const size = level.gridSize;
    const grid: GridCell[][] = Array.from({ length: size }, (_, r) =>
      Array.from({ length: size }, (_, c) => ({
        row: r,
        col: c,
        letter: '',
        isBlocked: true,
      }))
    );

    level.clues.forEach((clue) => {
      const { row, col, direction: dir, answer, number } = clue;
      for (let i = 0; i < answer.length; i++) {
        const r = dir === 'across' ? row : row + i;
        const c = dir === 'across' ? col + i : col;
        const cell = grid[r][c];
        cell.letter = answer[i];
        cell.isBlocked = false;

        if (i === 0) {
          cell.clueNumber = number;
        }
        if (dir === 'across') {
          cell.acrossClueNumber = number;
        } else {
          cell.downClueNumber = number;
        }
      }
    });

    return grid;
  }, [level]);

  // Select initial cell and load level data on level change
  useEffect(() => {
    const saved = stats.levelProgress[currentLevelNumber];
    const initialInput = saved?.userInput || {};
    setUserInput(initialInput);
    setIsLevelSolved(!!saved?.completed);
    setTimerSeconds(0);
    setErrorCells(new Set());
    setCheckFeedback(null);
    saveLastPlayedLevel(currentLevelNumber);

    // Find first playable cell
    for (let r = 0; r < level.gridSize; r++) {
      for (let c = 0; c < level.gridSize; c++) {
        if (!gridCells[r][c].isBlocked) {
          setSelectedCell({ row: r, col: c });
          setDirection('across');
          return;
        }
      }
    }
  }, [currentLevelNumber, level, gridCells]);

  // Timer interval
  useEffect(() => {
    if (isLevelSolved) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLevelSolved]);

  // Dedicated progress saver that only updates on user input actions
  const updateLevelUserInput = useCallback(
    (newInput: Record<string, string>) => {
      setUserInput(newInput);
      setStats((prev) => {
        const updated = {
          ...prev,
          lastPlayedLevel: currentLevelNumber,
          levelProgress: {
            ...prev.levelProgress,
            [currentLevelNumber]: {
              ...prev.levelProgress[currentLevelNumber],
              completed: prev.levelProgress[currentLevelNumber]?.completed || false,
              stars: prev.levelProgress[currentLevelNumber]?.stars || 0,
              userInput: newInput,
            },
          },
        };
        saveUserStats(updated);
        return updated;
      });
    },
    [currentLevelNumber]
  );

  // Determine active clue based on selected cell & direction
  const activeClue = useMemo(() => {
    if (!selectedCell) return null;
    const cell = gridCells[selectedCell.row]?.[selectedCell.col];
    if (!cell || cell.isBlocked) return null;

    let clueNum = direction === 'across' ? cell.acrossClueNumber : cell.downClueNumber;
    let actualDir = direction;

    if (!clueNum) {
      // Fallback to opposite direction if cell only belongs to one word
      actualDir = direction === 'across' ? 'down' : 'across';
      clueNum = actualDir === 'across' ? cell.acrossClueNumber : cell.downClueNumber;
    }

    if (!clueNum) return null;
    return level.clues.find((c) => c.number === clueNum && c.direction === actualDir) || null;
  }, [selectedCell, direction, gridCells, level.clues]);

  // Check if whole board is solved
  const checkBoardSolved = useCallback(
    (inputState: Record<string, string>) => {
      for (let r = 0; r < level.gridSize; r++) {
        for (let c = 0; c < level.gridSize; c++) {
          const cell = gridCells[r][c];
          if (!cell.isBlocked) {
            const entered = inputState[`${r},${c}`];
            if (!entered || entered !== cell.letter) {
              return false;
            }
          }
        }
      }
      return true;
    },
    [level.gridSize, gridCells]
  );

  // Handle Level Victory
  const triggerVictory = useCallback(
    (finalInput?: Record<string, string>) => {
      setIsLevelSolved(true);
      playVictorySound(stats.soundEnabled, level.isMilestone);

      const bonus = level.milestoneReward?.bonusCoins || 50;
      const { stats: updated, earnedCoins } = recordLevelCompletion(
        level.level,
        timerSeconds,
        level.isMilestone,
        level.milestoneReward?.badgeId,
        bonus,
        finalInput || userInput
      );

      setStats(updated);
      setLastEarnedCoins(earnedCoins);

      if (level.isMilestone) {
        setIsMilestoneModalOpen(true);
      } else {
        setIsVictoryModalOpen(true);
      }
    },
    [level, timerSeconds, stats.soundEnabled, userInput]
  );

  // Switch / Toggle Direction
  const toggleDirection = useCallback(() => {
    setDirection((prev) => (prev === 'across' ? 'down' : 'across'));
  }, []);

  // Cell Click Handler
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      const cell = gridCells[row]?.[col];
      if (!cell || cell.isBlocked) return;

      if (selectedCell?.row === row && selectedCell?.col === col) {
        // Toggle direction if clicking the same cell and it has words in both directions
        if (cell.acrossClueNumber && cell.downClueNumber) {
          toggleDirection();
        }
      } else {
        setSelectedCell({ row, col });
        // Automatically switch direction to match cell if it only has one word orientation
        if (cell.acrossClueNumber && !cell.downClueNumber) {
          setDirection('across');
        } else if (!cell.acrossClueNumber && cell.downClueNumber) {
          setDirection('down');
        }
      }
    },
    [gridCells, selectedCell, toggleDirection]
  );

  // Select Clue directly
  const handleSelectClue = useCallback((clue: ClueItem) => {
    setSelectedCell({ row: clue.row, col: clue.col });
    setDirection(clue.direction);
  }, []);

  // Advance cell inside active clue or grid
  const advanceCell = useCallback(
    (r: number, c: number, dir: Direction) => {
      const nextR = dir === 'across' ? r : r + 1;
      const nextC = dir === 'across' ? c + 1 : c;

      if (
        nextR < level.gridSize &&
        nextC < level.gridSize &&
        !gridCells[nextR][nextC].isBlocked
      ) {
        setSelectedCell({ row: nextR, col: nextC });
      }
    },
    [level.gridSize, gridCells]
  );

  // Step backwards
  const retreatCell = useCallback(
    (r: number, c: number, dir: Direction) => {
      const prevR = dir === 'across' ? r : r - 1;
      const prevC = dir === 'across' ? c - 1 : c;

      if (
        prevR >= 0 &&
        prevC >= 0 &&
        !gridCells[prevR][prevC].isBlocked
      ) {
        setSelectedCell({ row: prevR, col: prevC });
      }
    },
    [gridCells]
  );

  // Handle letter typing
  const handleInputLetter = useCallback(
    (char: string) => {
      if (!selectedCell || isLevelSolved) return;
      const { row, col } = selectedCell;
      const key = `${row},${col}`;

      playKeySound(stats.soundEnabled);

      const nextInput = { ...userInput, [key]: char.toUpperCase() };
      updateLevelUserInput(nextInput);

      // Remove error flag if previously marked
      if (errorCells.has(key)) {
        setErrorCells((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }

      // Check if board solved
      if (checkBoardSolved(nextInput)) {
        triggerVictory(nextInput);
        return;
      }

      // Check if current word solved
      if (activeClue) {
        let wordComplete = true;
        for (let i = 0; i < activeClue.answer.length; i++) {
          const checkR = activeClue.direction === 'across' ? activeClue.row : activeClue.row + i;
          const checkC = activeClue.direction === 'across' ? activeClue.col + i : activeClue.col;
          const k = `${checkR},${checkC}`;
          const val = k === key ? char.toUpperCase() : nextInput[k];
          if (val !== activeClue.answer[i]) {
            wordComplete = false;
            break;
          }
        }
        if (wordComplete) {
          playWordCompleteSound(stats.soundEnabled);
        }
      }

      // Advance along the active clue's orientation
      const effectiveDir = activeClue ? activeClue.direction : direction;
      advanceCell(row, col, effectiveDir);
    },
    [
      selectedCell,
      isLevelSolved,
      stats.soundEnabled,
      userInput,
      updateLevelUserInput,
      errorCells,
      checkBoardSolved,
      triggerVictory,
      activeClue,
      direction,
      advanceCell,
    ]
  );

  // Backspace logic
  const handleBackspace = useCallback(() => {
    if (!selectedCell || isLevelSolved) return;
    const { row, col } = selectedCell;
    const key = `${row},${col}`;
    const effectiveDir = activeClue ? activeClue.direction : direction;

    if (userInput[key]) {
      // Clear current cell
      const next = { ...userInput };
      delete next[key];
      updateLevelUserInput(next);
    } else {
      // Move backwards and clear previous cell
      retreatCell(row, col, effectiveDir);
      const prevR = effectiveDir === 'across' ? row : row - 1;
      const prevC = effectiveDir === 'across' ? col - 1 : col;
      const prevKey = `${prevR},${prevC}`;
      if (prevR >= 0 && prevC >= 0 && userInput[prevKey]) {
        const next = { ...userInput };
        delete next[prevKey];
        updateLevelUserInput(next);
      }
    }
  }, [selectedCell, isLevelSolved, userInput, updateLevelUserInput, retreatCell, activeClue, direction]);

  // Keyboard events listener
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if (!selectedCell || isLevelSolved) return;
      const { row, col } = selectedCell;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        for (let c = col + 1; c < level.gridSize; c++) {
          if (!gridCells[row][c].isBlocked) {
            setSelectedCell({ row, col: c });
            break;
          }
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        for (let c = col - 1; c >= 0; c--) {
          if (!gridCells[row][c].isBlocked) {
            setSelectedCell({ row, col: c });
            break;
          }
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        for (let r = row + 1; r < level.gridSize; r++) {
          if (!gridCells[r][col].isBlocked) {
            setSelectedCell({ row: r, col });
            break;
          }
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        for (let r = row - 1; r >= 0; r--) {
          if (!gridCells[r][col].isBlocked) {
            setSelectedCell({ row: r, col });
            break;
          }
        }
      } else if (e.key === ' ') {
        e.preventDefault();
        toggleDirection();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        // Cycle to next clue
        const currentIndex = level.clues.findIndex(
          (c) => c.number === activeClue?.number && c.direction === activeClue?.direction
        );
        const nextIndex = (currentIndex + 1) % level.clues.length;
        handleSelectClue(level.clues[nextIndex]);
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        handleInputLetter(e.key.toUpperCase());
      }
    },
    [
      selectedCell,
      isLevelSolved,
      level.gridSize,
      gridCells,
      toggleDirection,
      handleBackspace,
      level.clues,
      activeClue,
      handleSelectClue,
      handleInputLetter,
    ]
  );

  // Global window listener for keyboard typing
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (
        isLevelSelectorOpen ||
        isMilestoneModalOpen ||
        isVictoryModalOpen ||
        isBadgesModalOpen ||
        isHowToPlayOpen ||
        isSettingsOpen
      ) {
        return;
      }
      handleKeyDown(e as unknown as React.KeyboardEvent);
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    handleKeyDown,
    isLevelSelectorOpen,
    isMilestoneModalOpen,
    isVictoryModalOpen,
    isBadgesModalOpen,
    isHowToPlayOpen,
    isSettingsOpen,
  ]);

  // Navigate clues in sequence
  const handlePrevClue = () => {
    const currentIndex = level.clues.findIndex(
      (c) => c.number === activeClue?.number && c.direction === activeClue?.direction
    );
    const prevIndex = (currentIndex - 1 + level.clues.length) % level.clues.length;
    handleSelectClue(level.clues[prevIndex]);
  };

  const handleNextClue = () => {
    const currentIndex = level.clues.findIndex(
      (c) => c.number === activeClue?.number && c.direction === activeClue?.direction
    );
    const nextIndex = (currentIndex + 1) % level.clues.length;
    handleSelectClue(level.clues[nextIndex]);
  };

  // Reveal current selected cell letter (Hint)
  const handleRevealLetter = () => {
    if (!selectedCell || isLevelSolved || stats.coins < 15) return;

    // Pick target cell to reveal:
    // 1. Current cell if empty or incorrect
    // 2. Next cell in active clue if current cell is already filled correctly
    // 3. Any unsolved cell on the board if entire active word is filled
    let targetRow = selectedCell.row;
    let targetCol = selectedCell.col;
    let targetKey = `${targetRow},${targetCol}`;
    let solution = gridCells[targetRow]?.[targetCol]?.letter;

    if (!solution || userInput[targetKey] === solution) {
      let found = false;
      if (activeClue) {
        for (let i = 0; i < activeClue.answer.length; i++) {
          const r = activeClue.direction === 'across' ? activeClue.row : activeClue.row + i;
          const c = activeClue.direction === 'across' ? activeClue.col + i : activeClue.col;
          const k = `${r},${c}`;
          if (userInput[k] !== gridCells[r][c].letter) {
            targetRow = r;
            targetCol = c;
            targetKey = k;
            solution = gridCells[r][c].letter;
            found = true;
            break;
          }
        }
      }
      if (!found) {
        for (let r = 0; r < level.gridSize; r++) {
          for (let c = 0; c < level.gridSize; c++) {
            if (!gridCells[r][c].isBlocked && userInput[`${r},${c}`] !== gridCells[r][c].letter) {
              targetRow = r;
              targetCol = c;
              targetKey = `${r},${c}`;
              solution = gridCells[r][c].letter;
              found = true;
              break;
            }
          }
          if (found) break;
        }
      }
    }

    if (!solution || userInput[targetKey] === solution) return;

    setSelectedCell({ row: targetRow, col: targetCol });
    playHintSound(stats.soundEnabled);

    const nextInput = { ...userInput, [targetKey]: solution };
    updateLevelUserInput(nextInput);

    const updatedStats = {
      ...stats,
      coins: Math.max(0, stats.coins - 15),
    };
    setStats(updatedStats);
    saveUserStats(updatedStats);

    if (checkBoardSolved(nextInput)) {
      triggerVictory(nextInput);
    } else {
      const effectiveDir = activeClue ? activeClue.direction : direction;
      advanceCell(targetRow, targetCol, effectiveDir);
    }
  };

  // Check for mistakes (errors)
  const handleCheckErrors = () => {
    const wrong = new Set<string>();
    let enteredCount = 0;
    for (let r = 0; r < level.gridSize; r++) {
      for (let c = 0; c < level.gridSize; c++) {
        const key = `${r},${c}`;
        const entered = userInput[key];
        const correct = gridCells[r][c].letter;
        if (entered) {
          enteredCount++;
          if (entered !== correct) {
            wrong.add(key);
          }
        }
      }
    }
    setErrorCells(wrong);

    if (wrong.size > 0) {
      setCheckFeedback({
        type: 'error',
        message: `Found ${wrong.size} incorrect letter${wrong.size > 1 ? 's' : ''}`,
      });
      setTimeout(() => {
        setErrorCells(new Set());
        setCheckFeedback(null);
      }, 2500);
    } else if (enteredCount > 0) {
      playWordCompleteSound(stats.soundEnabled);
      setCheckFeedback({
        type: 'success',
        message: 'Looking great! All entered letters are correct.',
      });
      setTimeout(() => {
        setCheckFeedback(null);
      }, 2500);
    } else {
      setCheckFeedback({
        type: 'info',
        message: 'No letters entered yet.',
      });
      setTimeout(() => {
        setCheckFeedback(null);
      }, 2000);
    }
  };

  // Reset current board
  const handleResetBoard = () => {
    if (confirm('Reset this puzzle board? All letters will be cleared.')) {
      updateLevelUserInput({});
      setErrorCells(new Set());
      setIsLevelSolved(false);
      setTimerSeconds(0);
      setCheckFeedback(null);
    }
  };

  // Switch Levels
  const handleSelectLevel = (newLevel: number) => {
    setCurrentLevelNumber(newLevel);
    setIsLevelSolved(false);
  };

  const handleNextLevel = () => {
    if (currentLevelNumber < 50) {
      setCurrentLevelNumber((prev) => prev + 1);
      setIsVictoryModalOpen(false);
      setIsMilestoneModalOpen(false);
    }
  };

  const handlePrevLevel = () => {
    if (currentLevelNumber > 1) {
      setCurrentLevelNumber((prev) => prev - 1);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-amber-500 selection:text-stone-950">
      {/* Top Header */}
      <Navbar
        currentLevel={currentLevelNumber}
        totalLevels={ALL_LEVELS.length}
        stats={stats}
        onToggleSound={() => {
          const next = !stats.soundEnabled;
          setStats((prev) => {
            const updated = { ...prev, soundEnabled: next };
            saveUserStats(updated);
            return updated;
          });
        }}
        onOpenLevelSelector={() => setIsLevelSelectorOpen(true)}
        onOpenBadges={() => setIsBadgesModalOpen(true)}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Game Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col gap-4">
        {/* Stage Header Info Bar */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
          {/* Level navigation & Title */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handlePrevLevel}
              disabled={currentLevelNumber <= 1}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-750 disabled:opacity-30 disabled:cursor-not-allowed text-stone-200 transition cursor-pointer border border-stone-750"
              title="Previous Level"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                  Level {level.level}
                </span>
                <span className="text-xs text-stone-400">· {level.difficulty}</span>
                {level.isMilestone && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold flex items-center gap-1 uppercase tracking-wider">
                    <Trophy className="w-3 h-3" />
                    Milestone
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-stone-100 leading-tight">
                {level.theme}
              </h2>
            </div>

            <button
              onClick={handleNextLevel}
              disabled={currentLevelNumber >= 50 || currentLevelNumber >= stats.unlockedLevel}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-750 disabled:opacity-30 disabled:cursor-not-allowed text-stone-200 transition cursor-pointer border border-stone-750"
              title="Next Level"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Grid Spec & Timer & Reset */}
          <div className="flex items-center gap-3 text-xs">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-800/80 border border-stone-750 text-stone-300 font-mono">
              <span>{level.gridSize}×{level.gridSize} Grid</span>
              <span>·</span>
              <span>{level.clues.length} Words</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-800 border border-stone-700 text-stone-200 font-mono font-bold">
              <Timer className="w-3.5 h-3.5 text-amber-400" />
              <span>{formatTimer(timerSeconds)}</span>
            </div>

            <button
              onClick={handleResetBoard}
              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition cursor-pointer border border-stone-700"
              title="Reset Puzzle"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active Clue Banner */}
        {activeClue ? (
          <div className="bg-gradient-to-r from-amber-950/40 via-stone-900 to-stone-900 border border-amber-500/40 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 font-bold font-mono text-sm flex items-center justify-center shrink-0 shadow-sm">
                {activeClue.number}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1">
                  <span>{activeClue.direction}</span>
                  <span className="text-stone-400 font-mono">({activeClue.answer.length} letters)</span>
                </div>
                <div className="text-sm font-semibold text-stone-100 truncate sm:whitespace-normal">
                  {activeClue.clue}
                </div>
              </div>
            </div>

            <button
              onClick={toggleDirection}
              className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 border border-stone-700 text-xs font-semibold text-stone-300 hover:text-stone-100 shrink-0 transition cursor-pointer"
              title="Switch Direction (Space)"
            >
              Switch Direction
            </button>
          </div>
        ) : (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3 text-center text-xs text-stone-400">
            Click on any white grid cell or clue to begin solving!
          </div>
        )}

        {/* Check / Feedback Notification Toast */}
        {checkFeedback && (
          <div
            className={`w-full py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 animate-in fade-in transition duration-150 ${
              checkFeedback.type === 'error'
                ? 'bg-rose-950/60 border border-rose-500/50 text-rose-300 shadow-sm'
                : checkFeedback.type === 'success'
                ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 shadow-sm'
                : 'bg-stone-850 border border-stone-700 text-stone-300'
            }`}
          >
            {checkFeedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : checkFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-stone-400 shrink-0" />
            )}
            <span>{checkFeedback.message}</span>
          </div>
        )}

        {/* Game Layout: Grid + Clues */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left / Center: Crossword Board */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col items-center gap-4">
            <CrosswordGrid
              grid={gridCells}
              gridSize={level.gridSize}
              userInput={userInput}
              selectedCell={selectedCell}
              direction={direction}
              activeClue={activeClue}
              errorCells={errorCells}
              onCellClick={handleCellClick}
              onKeyDown={handleKeyDown}
            />

            {/* Virtual Touch Keypad for mobile/touch */}
            <VirtualKeyboard
              onKeyPress={handleInputLetter}
              onBackspace={handleBackspace}
              onToggleDirection={toggleDirection}
              direction={direction}
              onPrevClue={handlePrevClue}
              onNextClue={handleNextClue}
              onRevealLetter={handleRevealLetter}
              onCheckErrors={handleCheckErrors}
              coins={stats.coins}
            />
          </div>

          {/* Right: Across & Down Clues Lists */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-4">
            <CluesPanel
              clues={level.clues}
              activeClue={activeClue}
              direction={direction}
              userInput={userInput}
              onSelectClue={handleSelectClue}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <LevelSelector
        isOpen={isLevelSelectorOpen}
        onClose={() => setIsLevelSelectorOpen(false)}
        currentLevel={currentLevelNumber}
        onSelectLevel={handleSelectLevel}
        stats={stats}
      />

      <MilestoneModal
        isOpen={isMilestoneModalOpen}
        levelNumber={level.level}
        theme={level.theme}
        milestoneReward={level.milestoneReward}
        timeSeconds={timerSeconds}
        earnedCoins={lastEarnedCoins}
        adsRemoved={stats.adsRemoved}
        onOpenRemoveAds={() => {
          setIsMilestoneModalOpen(false);
          setIsSettingsOpen(true);
        }}
        onNextLevel={handleNextLevel}
        onReplay={handleResetBoard}
        onClose={() => setIsMilestoneModalOpen(false)}
      />

      <VictoryModal
        isOpen={isVictoryModalOpen}
        levelNumber={level.level}
        theme={level.theme}
        timeSeconds={timerSeconds}
        earnedCoins={lastEarnedCoins}
        adsRemoved={stats.adsRemoved}
        onOpenRemoveAds={() => {
          setIsVictoryModalOpen(false);
          setIsSettingsOpen(true);
        }}
        onNextLevel={handleNextLevel}
        onReplay={handleResetBoard}
        onClose={() => setIsVictoryModalOpen(false)}
      />

      <BadgesModal
        isOpen={isBadgesModalOpen}
        onClose={() => setIsBadgesModalOpen(false)}
        stats={stats}
      />

      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        stats={stats}
        onToggleSound={() => {
          const next = !stats.soundEnabled;
          setStats((prev) => {
            const updated = { ...prev, soundEnabled: next };
            saveUserStats(updated);
            return updated;
          });
        }}
        onToggleAdsRemoved={(removed) => {
          setStats((prev) => {
            const updated = { ...prev, adsRemoved: removed };
            saveUserStats(updated);
            return updated;
          });
        }}
        onOpenHowToPlay={() => {
          setIsSettingsOpen(false);
          setIsHowToPlayOpen(true);
        }}
        onResetProgress={() => {
          if (confirm('Are you sure you want to reset your puzzle progress, coins, and trophies?')) {
            const resetStats: UserStats = {
              coins: 100,
              unlockedLevel: 1,
              lastPlayedLevel: 1,
              completedLevels: [],
              badges: [],
              levelProgress: {},
              soundEnabled: stats.soundEnabled,
              adsRemoved: stats.adsRemoved,
            };
            setStats(resetStats);
            saveUserStats(resetStats);
            setCurrentLevelNumber(1);
            setUserInput({});
            setIsSettingsOpen(false);
          }
        }}
      />
    </div>
  );
}
