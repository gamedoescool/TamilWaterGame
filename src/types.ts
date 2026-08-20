export type Difficulty = 'easy' | 'medium' | 'hard';

export type GamePhase = 'start' | 'playing' | 'gameover';

export interface DropState {
  id: string;
  consonantIndex: number;
  vowelIndex: number;
  consonantChar: string;
  vowelChar: string;
  correctCompound: string;
  startTime: number;
  status: 'falling' | 'popped' | 'splashed';
}

export interface DifficultyConfig {
  fallDuration: number; // milliseconds
  gridSize: number; // total number of options
  columns: number;
  rows: number;
  label: string;
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: { fallDuration: 7000, gridSize: 4, columns: 2, rows: 2, label: 'Easy' },
  medium: { fallDuration: 5000, gridSize: 6, columns: 3, rows: 2, label: 'Medium' },
  hard: { fallDuration: 3000, gridSize: 8, columns: 4, rows: 2, label: 'Hard' },
};

export interface GameState {
  phase: GamePhase;
  difficulty: Difficulty;
  score: number;
  combo: number;
  timeRemaining: number;
  currentDrop: DropState | null;
  options: string[];
  inputFrozen: boolean;
}
