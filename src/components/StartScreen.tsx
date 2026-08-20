import type { Difficulty } from '../types';

interface StartScreenProps {
  onStart: (difficulty: Difficulty) => void;
}

const DIFFICULTIES: { key: Difficulty; label: string; desc: string }[] = [
  { key: 'easy', label: 'Easy', desc: '2x2 Grid, Slow' },
  { key: 'medium', label: 'Medium', desc: '2x3 Grid, Medium' },
  { key: 'hard', label: 'Hard', desc: '2x4 Grid, Fast' },
];

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="start-screen">
      <h1>Tamil Letter Rain</h1>
      <p>
        Catch the falling raindrops by selecting the correct Tamil compound
        letter!
      </p>
      <div className="difficulty-buttons">
        {DIFFICULTIES.map(({ key, label, desc }) => (
          <button
            key={key}
            className="difficulty-btn"
            onClick={() => onStart(key)}
          >
            <span className="difficulty-btn-label">{label}</span>
            <span className="difficulty-btn-desc">{desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
