import { useState, useEffect, useRef, useCallback } from 'react';
import type { Difficulty, GamePhase, DropState, GameState } from '../types';
import { DIFFICULTY_CONFIGS } from '../types';
import {
  TAMIL_CONSONANTS,
  TAMIL_VOWELS,
  getCompoundLetter,
  getRandomDistractors,
} from '../data/tamil-letters';
import { playPop, playSplash, playWrong, playCombo, playTick } from '../utils/audio';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function useGameEngine(difficulty: Difficulty) {
  const [phase, setPhase] = useState<GamePhase>('start');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(60000);
  const [currentDrop, setCurrentDrop] = useState<DropState | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [inputFrozen, setInputFrozen] = useState(false);

  const rafIdRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const currentDropRef = useRef<DropState | null>(null);
  const handleDropMissRef = useRef<() => void>(() => {});
  const lastSecondRef = useRef(Math.ceil(60));

  currentDropRef.current = currentDrop;

  const config = DIFFICULTY_CONFIGS[difficulty];

  const spawnDrop = useCallback(() => {
    const consonantIndex = Math.floor(Math.random() * TAMIL_CONSONANTS.length);
    const vowelIndex = Math.floor(Math.random() * TAMIL_VOWELS.length);
    const correctCompound = getCompoundLetter(consonantIndex, vowelIndex);
    const consonantChar = TAMIL_CONSONANTS[consonantIndex].char;
    const vowelChar = TAMIL_VOWELS[vowelIndex].char;
    const distractors = getRandomDistractors(correctCompound, config.gridSize - 1);
    const allOptions = shuffle([correctCompound, ...distractors]);

    const drop: DropState = {
      id: crypto.randomUUID(),
      consonantIndex,
      vowelIndex,
      consonantChar,
      vowelChar,
      correctCompound,
      startTime: Date.now(),
      status: 'falling',
    };

    setCurrentDrop(drop);
    setOptions(allOptions);
  }, [config.gridSize]);

  const handleDropMiss = useCallback(() => {
    setCombo(1);
    playSplash();
    setCurrentDrop(prev => (prev ? { ...prev, status: 'splashed' } : prev));
    setTimeout(() => spawnDrop(), 200);
  }, [spawnDrop]);

  handleDropMissRef.current = handleDropMiss;

  const startGame = useCallback(() => {
    setPhase('playing');
    setScore(0);
    setCombo(1);
    setTimeRemaining(60000);
    setInputFrozen(false);
    spawnDrop();
  }, [spawnDrop]);

  const handleAnswer = useCallback(
    (selectedCompound: string): { correct: boolean; wrongIndex?: number } => {
      if (inputFrozen || phase !== 'playing' || !currentDrop) {
        return { correct: false };
      }

      if (selectedCompound === currentDrop.correctCompound) {
        const dropProgress = (Date.now() - currentDrop.startTime) / config.fallDuration;
        const heightBonus = Math.floor((1 - Math.min(dropProgress, 1)) * 50);
        const scoreIncrease = (100 + heightBonus) * combo;

        setScore(prev => prev + scoreIncrease);
        setCombo(prev => Math.min(prev + 1, 3));
        setCurrentDrop(prev => (prev ? { ...prev, status: 'popped' } : prev));
        playPop();
        playCombo(Math.min(combo + 1, 3));
        setTimeout(() => spawnDrop(), 300);
        return { correct: true };
      }

      setCombo(1);
      playWrong();
      setInputFrozen(true);
      setTimeout(() => setInputFrozen(false), 500);
      return { correct: false, wrongIndex: options.indexOf(selectedCompound) };
    },
    [inputFrozen, phase, currentDrop, combo, config.fallDuration, options, spawnDrop],
  );

  // Timer: requestAnimationFrame loop
  useEffect(() => {
    if (phase !== 'playing') return;

    lastFrameTimeRef.current = performance.now();

    const tick = (now: number) => {
      const deltaMs = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      setTimeRemaining(prev => {
        const newTime = Math.max(prev - deltaMs, 0);
        const currentSecond = Math.ceil(newTime / 1000);
        if (currentSecond <= 10 && currentSecond !== lastSecondRef.current && currentSecond > 0) {
          playTick();
        }
        lastSecondRef.current = currentSecond;
        return newTime;
      });

      const drop = currentDropRef.current;
      if (drop && drop.status === 'falling') {
        const elapsed = Date.now() - drop.startTime;
        if (elapsed >= config.fallDuration) {
          handleDropMissRef.current();
        }
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafIdRef.current);
    };
  }, [phase, config.fallDuration]);

  // Game over detection
  useEffect(() => {
    if (timeRemaining <= 0 && phase === 'playing') {
      setPhase('gameover');
      setCurrentDrop(null);
    }
  }, [timeRemaining, phase]);

  const gameState: GameState = {
    phase,
    difficulty,
    score,
    combo,
    timeRemaining,
    currentDrop,
    options,
    inputFrozen,
  };

  return {
    gameState,
    startGame,
    handleAnswer,
    handleDropMiss,
  };
}
