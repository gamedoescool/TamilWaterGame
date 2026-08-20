import type { Difficulty } from '../types';

interface LetterGridProps {
  options: string[];
  difficulty: Difficulty;
  disabled: boolean;
  onSelect: (selected: string) => void;
  wrongIndex?: number;
}

export function LetterGrid({
  options,
  difficulty,
  disabled,
  onSelect,
  wrongIndex,
}: LetterGridProps) {
  return (
    <div
      className={`letter-grid letter-grid--${difficulty}`}
      role="group"
      aria-label="Letter options"
    >
      {options.map((compound, index) => (
        <button
          key={index}
          className={`letter-btn${wrongIndex === index ? ' letter-btn--wrong' : ''}${disabled ? ' letter-btn--frozen' : ''}`}
          onClick={() => onSelect(compound)}
          disabled={disabled}
          aria-label={compound}
        >
          {compound}
        </button>
      ))}
    </div>
  );
}
