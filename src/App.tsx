import { useState } from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { StartScreen } from './components/StartScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { Raindrop } from './components/Raindrop';
import { TargetDisplay } from './components/TargetDisplay';
import { HUD } from './components/HUD';
import type { Difficulty } from './types';
import { DIFFICULTY_CONFIGS } from './types';
import './styles/game.css';

function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const { gameState, startGame, handleDropClick } =
    useGameEngine(difficulty);

  const handleStart = (d: Difficulty) => {
    setDifficulty(d);
    startGame();
  };

  const handleReplay = (d: Difficulty) => {
    setDifficulty(d);
    startGame();
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
        {gameState.drops
          .filter(d => d.status !== 'splashed')
          .map(drop => (
            <Raindrop
              key={drop.id}
              drop={drop}
              fallDuration={config.fallDuration}
              onClick={handleDropClick}
            />
          ))}
      </div>
      <div className="water-area">
        {gameState.targetConsonant && (
          <TargetDisplay
            consonant={gameState.targetConsonant}
            vowel={gameState.targetVowel}
          />
        )}
      </div>
    </div>
  );
}

export default App;
