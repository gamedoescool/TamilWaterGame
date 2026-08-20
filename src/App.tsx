import { useState, useEffect, useRef } from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { StartScreen } from './components/StartScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { Raindrop } from './components/Raindrop';
import { LetterGrid } from './components/LetterGrid';
import { HUD } from './components/HUD';
import type { Difficulty } from './types';
import { DIFFICULTY_CONFIGS } from './types';
import './styles/game.css';

function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const { gameState, startGame, handleAnswer, handleDropMiss } =
    useGameEngine(difficulty);
  const [wrongIndex, setWrongIndex] = useState<number | undefined>();
  const pendingStartRef = useRef(false);

  // When difficulty changes and a start is pending, fire startGame
  // on the next render so the hook has the updated config.
  useEffect(() => {
    if (pendingStartRef.current) {
      pendingStartRef.current = false;
      startGame();
    }
  }, [difficulty, startGame]);

  const handleStart = (d: Difficulty) => {
    pendingStartRef.current = true;
    setDifficulty(d);
  };

  const handleSelect = (selected: string) => {
    const result = handleAnswer(selected);
    if (!result.correct && result.wrongIndex !== undefined) {
      setWrongIndex(result.wrongIndex);
      setTimeout(() => setWrongIndex(undefined), 500);
    }
  };

  const handleReplay = (d: Difficulty) => {
    pendingStartRef.current = true;
    setDifficulty(d);
  };

  if (gameState.phase === 'start') {
    return <StartScreen onStart={handleStart} />;
  }

  if (gameState.phase === 'gameover') {
    return <GameOverScreen score={gameState.score} onReplay={handleReplay} />;
  }

  const config = DIFFICULTY_CONFIGS[difficulty];

  return (
    <div className="game-container">
      <HUD
        timeRemaining={gameState.timeRemaining}
        score={gameState.score}
        combo={gameState.combo}
      />
      <div className="sky-area">
        {gameState.currentDrop &&
          gameState.currentDrop.status !== 'splashed' && (
            <Raindrop
              drop={gameState.currentDrop}
              fallDuration={config.fallDuration}
              onMiss={handleDropMiss}
            />
          )}
      </div>
      <div className="water-area">
        <LetterGrid
          options={gameState.options}
          difficulty={difficulty}
          disabled={gameState.inputFrozen}
          onSelect={handleSelect}
          wrongIndex={wrongIndex}
        />
      </div>
    </div>
  );
}

export default App;
