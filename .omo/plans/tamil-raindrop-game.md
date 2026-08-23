# tamil-raindrop-game - Work Plan

## TL;DR (For humans)

**What you'll get:** A fully playable 60-second Tamil compound letter raindrop game. Falling drops show a consonant + vowel equation (e.g., க் + ஆ), and you tap the correct combined letter from a grid before it hits the water. Three difficulty levels, combo scoring, pop/splash animations, and synthesized sound effects - all in the browser.

**Why this approach:** Pure React + CSS with zero external dependencies. The game is simple enough that a game engine would be overkill. CSS animations handle the smooth raindrop falling, a requestAnimationFrame loop handles game logic, and Web Audio API handles sound. Everything runs client-side with no backend.

**What it will NOT do:** No multiplayer, no persistent high scores, no mobile app features, no custom font bundling, no tutorial/onboarding flow.

**Effort:** Medium (8 todos across 3 waves, ~4-6 files created + 2 modified)
**Risk:** Low - no external deps, no backend, pure client-side game
**Decisions to sanity-check:** CSS animations for raindrop fall (vs JS-driven position updates), Web Audio synthesis (vs bundled audio files), no state library

Your next move: approve, or run a high-accuracy review first. Full execution detail follows below.

---

> TL;DR (machine): Medium effort, Low risk, 8 todos across 3 waves. Pure React+CSS Tamil letter raindrop game with zero deps. 3 difficulty tiers, combo scoring, synthesized audio.

## Scope
### Must have
- 60-second countdown timer per round
- 3 difficulty tiers: Easy (2x2, slow), Medium (2x3, medium), Hard (2x4, fast)
- Falling raindrops with consonant + vowel equation display
- Button grid with correct answer + random distractors from 216-letter master array
- Scoring: +100 base, height bonus, combo multiplier (1x/2x/3x)
- Correct tap: pop effect, score add, combo up, next drop
- Incorrect tap: red flash, 0.5s freeze, combo reset to 1x
- Drop miss: splash effect, combo reset, new drop spawns
- Start screen with difficulty selection
- Game over screen with final score
- Water/rain visual theme (sky background, animated drops, water body)
- Sound effects via Web Audio API

### Must NOT have (guardrails, anti-slop, scope boundaries)
- No external dependencies beyond React/React-DOM (already installed)
- No game engine libraries (Phaser, PixiJS, etc.)
- No state management libraries (Redux, Zustand, Jotai, etc.)
- No animation libraries (Framer Motion, react-spring, etc.)
- No audio file assets (all synthesized via Web Audio API)
- No custom font files bundled (use system Tamil font stack)
- No multiplayer, online features, or backend
- No persistent storage (localStorage, IndexedDB)
- No settings page, achievements, or unlockables
- No tutorial or onboarding flow
- No mobile-native features

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: tests-after + Vitest (install as dev dep)
- Evidence: .omo/evidence/task-<N>-tamil-raindrop-game.<ext>
- Each todo includes happy + failure QA scenarios with exact tool invocations
- Final wave: F1 plan compliance, F2 code quality (oxlint + tsc), F3 manual QA (dev server + Playwright), F4 scope fidelity

## Execution strategy
### Parallel execution waves

**Wave 1 (Foundation):** Tamil data module + project cleanup + CSS theme shell
- Todos 1, 2, 3 can run in parallel (no interdependencies)

**Wave 2 (Core Engine):** Game engine hook + raindrop component + letter grid
- Todos 4, 5, 6 - Todo 4 (engine) blocks 5 and 6, but 5 and 6 can parallelize after 4

**Wave 3 (Polish):** Screens + audio + integration
- Todos 7, 8 can run in parallel

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. tamil-letters.ts | - | 4, 5, 6 | 2, 3 |
| 2. index.css theme | - | 5, 6, 7 | 1, 3 |
| 3. App.tsx shell + game types | - | 4, 5, 6, 7 | 1, 2 |
| 4. useGameEngine hook | 1, 3 | 5, 6, 7 | - |
| 5. Raindrop component | 1, 2, 3, 4 | 7 | 6 |
| 6. LetterGrid component | 1, 2, 3, 4 | 7 | 5 |
| 7. Screens (Start + GameOver) | 2, 3, 4, 5, 6 | 8 | - |
| 8. Audio + final polish | 4, 5, 6, 7 | - | - |

## Todos
> Implementation + Test = ONE todo. Never separate.
<!-- APPEND TASK BATCHES BELOW THIS LINE WITH edit/apply_patch - never rewrite the headers above. -->

- [x] 1. Create Tamil letter data module (src/data/tamil-letters.ts)
  What to do / Must NOT do:
  - Create `src/data/tamil-letters.ts` with:
    - `TAMIL_CONSONANTS`: array of 18 objects `{ char: string, name: string, transliteration: string }` with Unicode code points U+0B95 through U+0BB5 in traditional order (க, ங, ச, ஞ, ட, ண, த, ந, ப, ம, ய, ர, ல, ழ, ள, ற, ன, வ)
    - `TAMIL_VOWELS`: array of 12 objects `{ char: string, name: string, transliteration: string }` with Unicode U+0B85-U+0B94 (அ, ஆ, இ, ஈ, உ, ஊ, எ, ஏ, ஐ, ஒ, ஓ, ஔ)
    - `TAMIL_VOWEL_SIGNS`: array of 12 entries (null for inherent அ, then U+0BBE through U+0BCC) - these are the combining modifier forms
    - `VIRAMA`: string `'\u0BCD'` (the pulli/pure consonant marker)
    - `generateAllCompounds()`: function returning array of 216 `{ consonant: string, vowel: string, compound: string, consonantIndex: number, vowelIndex: number }` - iterates 18 consonants x 12 vowels, for vowel index 0 (அ) compound = consonant char alone, for others compound = consonant char + vowel sign
    - `getCompoundLetter(consonantIndex, vowelIndex)`: returns the compound string for given indices
    - `getRandomDistractors(correctCompound, count)`: picks `count` random compounds from the 216 array that are NOT the correct answer
  - Export all as named exports, use `as const` for the static arrays
  - Do NOT add any React imports or UI code - this is a pure data module
  - Do NOT use NFD decomposition - use NFC (precomposed) vowel sign code points
  Parallelization: Wave 1 | Blocked by: - | Blocks: 4, 5, 6
  References (executor has NO interview context - be exhaustive):
  - Tamil Unicode block: U+0B80-U+0BFF
  - 18 consonants: க(U+0B95), ங(U+0B99), ச(U+0B9A), ஞ(U+0B9E), ட(U+0B9F), ண(U+0BA3), த(U+0BA4), ந(U+0BA8), ப(U+0BAA), ம(U+0BAE), ய(U+0BAF), ர(U+0BB0), ல(U+0BB2), ழ(U+0BB4), ள(U+0BB3), ற(U+0BB1), ன(U+0BA9), வ(U+0BB5)
  - 12 vowels: அ(U+0B85), ஆ(U+0B86), இ(U+0B87), ஈ(U+0B88), உ(U+0B89), ஊ(U+0B8A), எ(U+0B8E), ஏ(U+0B8F), ஐ(U+0B90), ஒ(U+0B92), ஓ(U+0B93), ஔ(U+0B94)
  - 12 vowel signs: null(inherent அ), ா(U+0BBE), ி(U+0BBF), ீ(U+0BC0), ு(U+0BC1), ூ(U+0BC2), ெ(U+0BC6), ே(U+0BC7), ை(U+0BC8), ொ(U+0BCA), ோ(U+0BCB), ௌ(U+0BCC)
  - Virama: ்(U+0BCD)
  - Pre-base modifiers (ெ, ே, ை, ொ, ோ, ௌ) render LEFT of consonant - font handles this
  - NFC vs NFD: ொ(U+0BCA) decomposes to ெ(U+0BC6)+ா(U+0BBE) in NFD - use NFC
  Acceptance criteria (agent-executable):
  - `node -e "const m = require('./src/data/tamil-letters.ts'); console.log(m.generateAllCompounds().length)"` prints 216 (use tsx or ts-node)
  - `getRandomDistractors('கா', 3)` returns exactly 3 items, none equal to 'கா'
  - `getCompoundLetter(0, 1)` returns 'கா' (க + ஆ modifier)
  - `getCompoundLetter(0, 0)` returns 'க' (inherent அ, no modifier)
  - All 18 consonants x 12 vowels produce valid Tamil Unicode strings
  QA scenarios (name the exact tool + invocation):
  - Happy: Run `npx tsx -e "import { generateAllCompounds, getRandomDistractors, getCompoundLetter } from './src/data/tamil-letters'; const c = generateAllCompounds(); console.log('Total:', c.length); console.log('First:', c[0].compound); console.log('கா:', getCompoundLetter(0,1)); console.log('Distractors:', getRandomDistractors('கா', 3))"` - expect 216 total, correct compound strings, 3 unique distractors
  - Failure: Verify `getRandomDistractors` never returns the correct answer by running it 100 times with a loop
  Evidence: .omo/evidence/task-1-tamil-raindrop-game.txt
  Commit: Y | feat(data): add Tamil compound letter data module with 216 letters

- [x] 2. Create game CSS theme and visual foundation (src/index.css + src/styles/game.css)
  What to do / Must NOT do:
  - Replace `src/index.css` content with game-themed styles:
    - `:root` with CSS custom properties for the water/rain theme: sky gradient colors (#87CEEB top to #4A90D9 mid to #2C5F8A bottom), water body color (#1a5276), drop color (#64B5F6), button colors, text colors
    - `body` and `#root`: full viewport, no scroll, overflow hidden
    - Remove ALL existing Vite template styles (hero, counter, ticks, next-steps, spacer sections)
  - Create `src/styles/game.css` with:
    - `.game-container`: full viewport, flex column, position relative
    - `.sky-area`: top 60% of viewport, gradient background, position relative, overflow hidden
    - `.water-area`: bottom 40% of viewport, water body with subtle wave animation (CSS keyframe), contains the letter grid
    - `.raindrop`: position absolute, rounded shape (border-radius 50% 50% 50% 50% / 60% 60% 40% 40%), blue gradient, box-shadow for glow, font-size large enough for Tamil text
    - `.raindrop-falling`: animation `fall` keyframe (translateY from -60px to calc(100vh * 0.6)), animation-duration set via CSS variable `--fall-duration`
    - `.raindrop-pop`: scale(1.3) + opacity(0) transition, 200ms
    - `.raindrop-splash`: scale(0.5) + opacity(0) + translateY(20px) transition, 300ms
    - `.letter-grid`: CSS Grid, gap 12px, centered in water area, responsive
    - `.letter-grid--easy`: grid-template-columns: repeat(2, 1fr), 2 rows
    - `.letter-grid--medium`: grid-template-columns: repeat(3, 1fr), 2 rows
    - `.letter-grid--hard`: grid-template-columns: repeat(4, 1fr), 2 rows
    - `.letter-btn`: large touch-friendly buttons (min 64px easy, 52px medium, 44px hard), rounded, Tamil font, hover/active states
    - `.letter-btn--correct`: green flash animation on correct tap
    - `.letter-btn--wrong`: red flash animation on incorrect tap
    - `.letter-btn--frozen`: opacity 0.5, pointer-events none (during 0.5s freeze)
    - `.hud`: fixed top bar, flex row, semi-transparent backdrop, timer + score + combo
    - `.combo-indicator`: scale pulse animation when combo increases
    - `.start-screen`: centered overlay, difficulty buttons styled as water droplets
    - `.game-over-screen`: centered overlay with final score, replay button
    - Water wave animation: `@keyframes wave` using CSS transform on pseudo-elements
    - Rain particle effect: subtle CSS-only rain using pseudo-elements with repeating-linear-gradient
  - Use system Tamil font stack: `'Noto Sans Tamil', 'TAU_Elango', 'Lohit Tamil', system-ui, sans-serif`
  - Do NOT add any external CSS frameworks or icon libraries
  - Do NOT use CSS-in-JS or styled-components - plain CSS files only
  - Ensure dark/light mode works via prefers-color-scheme (but game primarily uses its own theme)
  Parallelization: Wave 1 | Blocked by: - | Blocks: 5, 6, 7
  References (executor has NO interview context - be exhaustive):
  - Existing src/index.css:1-111 (replace entirely)
  - Existing src/App.css:1-184 (replace entirely)
  - CSS Grid for button layout: grid-template-columns with repeat()
  - CSS custom properties for theming: --sky-top, --sky-mid, --sky-bottom, --water, --drop-bg, --drop-shadow
  - @keyframes for fall animation: translateY from start to end position
  - Tamil font stack: 'Noto Sans Tamil', 'TAU_Elango', 'Lohit Tamil', system-ui, sans-serif
  - CSS animation-duration for difficulty-based fall speed: --fall-duration: 7s (easy), 5s (medium), 3s (hard)
  Acceptance criteria (agent-executable):
  - `npx vite build` succeeds with no CSS errors
  - Opening dev server shows sky gradient background (no Vite template content visible)
  - `.game-container` fills viewport with no scrollbar
  - `.water-area` shows at bottom with wave animation
  - `.letter-grid--easy` renders as 2-column grid
  - `.letter-grid--medium` renders as 3-column grid
  - `.letter-grid--hard` renders as 4-column grid
  - Tamil text renders correctly in buttons (test with கா, கோ, சீ)
  QA scenarios (name the exact tool + invocation):
  - Happy: Start dev server `npx vite`, open in browser, verify sky gradient visible, water area at bottom, no Vite template content
  - Failure: Verify no scrollbar appears on the page, grid layouts are correct for each difficulty class
  Evidence: .omo/evidence/task-2-tamil-raindrop-game.png
  Commit: Y | feat(styles): add water/rain game theme with responsive letter grid

- [x] 3. Create game TypeScript types and App shell (src/types.ts + src/App.tsx)
  What to do / Must NOT do:
  - Create `src/types.ts` with:
    - `Difficulty` type: `'easy' | 'medium' | 'hard'`
    - `GamePhase` type: `'start' | 'playing' | 'gameover'`
    - `DropState` interface: `{ id: string, consonantIndex: number, vowelIndex: number, consonantChar: string, vowelChar: string, correctCompound: string, startTime: number, status: 'falling' | 'popped' | 'splashed' }`
    - `DifficultyConfig` interface: `{ fallDuration: number, gridSize: number, columns: number, rows: number, label: string }`
    - `DIFFICULTY_CONFIGS` record mapping Difficulty to DifficultyConfig: easy={fallDuration:7000, gridSize:4, columns:2, rows:2, label:'Easy'}, medium={fallDuration:5000, gridSize:6, columns:3, rows:2, label:'Medium'}, hard={fallDuration:3000, gridSize:8, columns:4, rows:2, label:'Hard'}
    - `GameState` interface: `{ phase: GamePhase, difficulty: Difficulty, score: number, combo: number, timeRemaining: number, currentDrop: DropState | null, options: string[], inputFrozen: boolean }`
  - Replace `src/App.tsx` with a minimal shell:
    - Import game types
    - Render a `<div className="game-container">` wrapper
    - Placeholder for game phases (will be filled in later todos)
    - Remove ALL Vite template JSX (hero, counter, ticks, next-steps, spacer)
    - Remove unused imports (reactLogo, viteLogo, heroImg)
  - Delete `src/App.css` content (styles moved to game.css in todo 2)
  - Do NOT implement game logic yet - just the type definitions and App shell
  - Do NOT add useState or any hooks yet
  Parallelization: Wave 1 | Blocked by: - | Blocks: 4, 5, 6, 7
  References (executor has NO interview context - be exhaustive):
  - Existing src/App.tsx:1-122 (replace entirely)
  - Existing src/App.css:1-184 (clear or delete)
  - TypeScript strict mode enabled (tsconfig.app.json:20-24)
  - noUnusedLocals and noUnusedParameters are true - ensure all types are used
  Acceptance criteria (agent-executable):
  - `npx tsc -b` compiles with zero errors
  - `src/types.ts` exports Difficulty, GamePhase, DropState, DifficultyConfig, DIFFICULTY_CONFIGS, GameState
  - `src/App.tsx` renders a div with className="game-container" and no Vite template content
  - No unused imports in App.tsx
  QA scenarios (name the exact tool + invocation):
  - Happy: `npx tsc -b` exits 0, `npx vite build` succeeds
  - Failure: Verify no TypeScript errors, no unused import warnings
  Evidence: .omo/evidence/task-3-tamil-raindrop-game.txt
  Commit: Y | feat(types): add game TypeScript types and clean App shell

- [x] 4. Build game engine hook (src/hooks/useGameEngine.ts)
  What to do / Must NOT do:
  - Create `src/hooks/useGameEngine.ts` exporting `useGameEngine(difficulty: Difficulty)` hook
  - Internal state (useReducer or useState):
    - `phase`: GamePhase (start -> playing -> gameover)
    - `score`: number (starts at 0)
    - `combo`: number (starts at 1, max 3)
    - `timeRemaining`: number (starts at 60000ms, counts down)
    - `currentDrop`: DropState | null
    - `options`: string[] (current grid options)
    - `inputFrozen`: boolean (for 0.5s penalty freeze)
  - Core functions returned by the hook:
    - `startGame()`: sets phase to 'playing', resets score/combo/time, spawns first drop
    - `handleAnswer(selectedCompound: string)`: checks if selected matches currentDrop.correctCompound
      - Correct: increment score by (100 + heightBonus) * combo, increment combo (max 3), set drop status to 'popped', spawn next drop after 300ms delay
      - Incorrect: set inputFrozen=true for 500ms, reset combo to 1, flash the wrong button (return which button was wrong)
    - `handleDropMiss()`: called when drop reaches bottom, reset combo to 1, set drop status to 'splashed', spawn next drop immediately
    - `getDropProgress()`: returns 0-1 progress of current drop based on elapsed time vs fallDuration
  - Drop spawning logic:
    - Pick random consonant (0-17) and random vowel (0-11)
    - Generate correct compound using getCompoundLetter()
    - Generate N-1 distractors using getRandomDistractors()
    - Combine correct + distractors, shuffle (Fisher-Yates), set as options
    - Create new DropState with current timestamp as startTime
  - Timer logic:
    - Use requestAnimationFrame loop
    - Each frame: calculate elapsed since last frame, subtract from timeRemaining
    - Check if timeRemaining <= 0: set phase to 'gameover', clear current drop
    - Check if currentDrop elapsed time >= fallDuration: call handleDropMiss()
    - Return cleanup function that cancels the rAF
  - Height bonus calculation:
    - `heightBonus = Math.floor((1 - dropProgress) * 50)` where dropProgress is 0 (top) to 1 (bottom)
    - So clearing at top = +50 bonus, clearing at bottom = +0 bonus
  - Score formula: `(100 + heightBonus) * combo`
  - Input freeze: when inputFrozen is true, handleAnswer() returns early without processing
  - Do NOT use setInterval - use requestAnimationFrame for smooth timer
  - Do NOT implement audio triggers yet (todo 8)
  - Do NOT implement visual rendering (todos 5, 6)
  Parallelization: Wave 2 | Blocked by: 1, 3 | Blocks: 5, 6, 7
  References (executor has NO interview context - be exhaustive):
  - src/data/tamil-letters.ts (todo 1): generateAllCompounds, getCompoundLetter, getRandomDistractors
  - src/types.ts (todo 3): Difficulty, GamePhase, DropState, GameState, DIFFICULTY_CONFIGS
  - requestAnimationFrame pattern: let rafId; const loop = (timestamp) => { ... rafId = requestAnimationFrame(loop) }; rafId = requestAnimationFrame(loop); return () => cancelAnimationFrame(rafId)
  - Fisher-Yates shuffle: for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  - Combo multiplier: min(combo + 1, 3) on correct, reset to 1 on wrong/miss
  - Height bonus: Math.floor((1 - progress) * 50), progress = (now - drop.startTime) / fallDuration
  Acceptance criteria (agent-executable):
  - `npx tsc -b` compiles with zero errors
  - Hook returns: { gameState, startGame, handleAnswer, handleDropMiss, getDropProgress }
  - gameState includes: phase, score, combo, timeRemaining, currentDrop, options, inputFrozen
  - startGame() sets phase to 'playing' and creates a drop with 4/6/8 options based on difficulty
  - handleAnswer with correct compound increases score and combo
  - handleAnswer with wrong compound freezes input and resets combo
  - handleDropMiss resets combo to 1
  - Timer counts down from 60 to 0 and triggers gameover
  QA scenarios (name the exact tool + invocation):
  - Happy: Render hook in a test component, call startGame(), verify phase='playing', verify currentDrop exists, call handleAnswer with correct compound, verify score > 0 and combo = 2
  - Failure: Call handleAnswer with wrong compound, verify combo resets to 1 and inputFrozen = true
  Evidence: .omo/evidence/task-4-tamil-raindrop-game.txt
  Commit: Y | feat(engine): add game engine hook with timer, scoring, and combo logic

- [x] 5. Build Raindrop component (src/components/Raindrop.tsx)
  What to do / Must NOT do:
  - Create `src/components/Raindrop.tsx`
  - Props: `{ drop: DropState, fallDuration: number, onMiss: () => void }`
  - Render:
    - A `<div className="raindrop raindrop-falling">` positioned absolutely in the sky area
    - Display the equation inside: `${consonantChar} + ${vowelChar}` (e.g., "க + ஆ")
    - Style with CSS variable `--fall-duration: ${fallDuration}ms`
    - Horizontal position: random but fixed per drop (use drop.id to seed a deterministic position between 10%-90% of container width)
  - Animation:
    - CSS animation `fall` moves drop from top (translateY: -60px) to bottom of sky area (translateY: calc(100% of sky area))
    - When animation ends (onAnimationEnd), call onMiss()
  - Status transitions:
    - When drop.status changes to 'popped': add class `raindrop-pop`, remove `raindrop-falling`
    - When drop.status changes to 'splashed': add class `raindrop-splash`, remove `raindrop-falling`
    - After pop/splash animation ends (onTransitionEnd), the component can unmount
  - The equation text should be clearly readable inside the raindrop shape
  - Do NOT implement the letter grid (todo 6)
  - Do NOT implement sound effects (todo 8)
  Parallelization: Wave 2 | Blocked by: 1, 2, 3, 4 | Blocks: 7
  References (executor has NO interview context - be exhaustive):
  - src/types.ts (todo 3): DropState interface
  - src/styles/game.css (todo 2): .raindrop, .raindrop-falling, .raindrop-pop, .raindrop-splash classes
  - CSS animation: @keyframes fall { from { transform: translateY(-60px); } to { transform: translateY(var(--fall-end)); } }
  - onAnimationEnd fires when CSS animation completes
  - Deterministic horizontal position: hash drop.id to get a number between 0.1 and 0.9
  Acceptance criteria (agent-executable):
  - `npx tsc -b` compiles with zero errors
  - Component renders a div with className containing "raindrop"
  - Equation text (consonant + vowel) is visible inside the drop
  - Drop falls from top to bottom over the specified fallDuration
  - When status='popped', pop animation plays
  - When status='splashed', splash animation plays
  - onMiss is called when fall animation completes
  QA scenarios (name the exact tool + invocation):
  - Happy: Render Raindrop with a mock DropState, verify the equation text is in the DOM, verify the fall animation class is applied
  - Failure: Verify onMiss callback fires when animation ends (use onAnimationEnd spy)
  Evidence: .omo/evidence/task-5-tamil-raindrop-game.png
  Commit: Y | feat(raindrop): add falling raindrop component with pop/splash animations

- [x] 6. Build LetterGrid component (src/components/LetterGrid.tsx)
  What to do / Must NOT do:
  - Create `src/components/LetterGrid.tsx`
  - Props: `{ options: string[], correctAnswer: string, difficulty: Difficulty, disabled: boolean, onSelect: (selected: string) => void }`
  - Render:
    - A `<div className={`letter-grid letter-grid--${difficulty}`}>` containing N buttons
    - Each button: `<button className="letter-btn">{compound}</button>` displaying the Tamil compound letter
    - Button size adapts to difficulty class (easy=large, medium=medium, hard=compact)
  - Interaction:
    - On button click: call `onSelect(compound)` with the button's compound string
    - If `disabled` prop is true, all buttons get `pointer-events: none` and reduced opacity
  - Visual feedback (managed via className, actual CSS in todo 2):
    - When onSelect is called, the parent will handle logic and pass back feedback
    - Component itself does NOT manage correct/wrong state - it just renders and calls onSelect
  - Accessibility:
    - Each button has `aria-label` with the Tamil compound letter
    - Grid has `role="group"` and `aria-label="Letter options"`
  - Do NOT implement game logic (handled by useGameEngine in todo 4)
  - Do NOT implement audio feedback (todo 8)
  Parallelization: Wave 2 | Blocked by: 1, 2, 3, 4 | Blocks: 7
  References (executor has NO interview context - be exhaustive):
  - src/types.ts (todo 3): Difficulty type
  - src/styles/game.css (todo 2): .letter-grid, .letter-grid--easy/medium/hard, .letter-btn classes
  - DIFFICULTY_CONFIGS from types.ts: gridSize determines number of buttons (4, 6, or 8)
  - CSS Grid: grid-template-columns: repeat(N, 1fr) where N = columns from config
  Acceptance criteria (agent-executable):
  - `npx tsc -b` compiles with zero errors
  - Component renders N buttons matching difficulty (4 for easy, 6 for medium, 8 for hard)
  - Each button displays a Tamil compound letter string
  - Clicking a button calls onSelect with that button's compound string
  - When disabled=true, buttons are not clickable
  - Grid layout matches difficulty (2x2, 2x3, 2x4)
  QA scenarios (name the exact tool + invocation):
  - Happy: Render LetterGrid with easy difficulty and 4 options, click first button, verify onSelect called with correct compound
  - Failure: Render with disabled=true, click a button, verify onSelect is NOT called
  Evidence: .omo/evidence/task-6-tamil-raindrop-game.png
  Commit: Y | feat(grid): add letter selection grid with difficulty-based layouts

- [x] 7. Build StartScreen and GameOverScreen (src/components/StartScreen.tsx + GameOverScreen.tsx) and wire App.tsx
  What to do / Must NOT do:
  - Create `src/components/StartScreen.tsx`:
    - Props: `{ onStart: (difficulty: Difficulty) => void }`
    - Render: centered overlay with game title "Tamil Letter Rain", subtitle explaining the game, and 3 difficulty buttons (Easy/Medium/Hard)
    - Each button shows: difficulty name, grid size, speed description
    - Styled with `.start-screen` class, buttons styled as water droplets
  - Create `src/components/GameOverScreen.tsx`:
    - Props: `{ score: number, onReplay: (difficulty: Difficulty) => void }`
    - Render: centered overlay with "Time's Up!" heading, final score display (large, animated), and 3 replay buttons (one per difficulty)
    - Score should animate counting up from 0 to final value (CSS animation or JS)
  - Create `src/components/HUD.tsx`:
    - Props: `{ timeRemaining: number, score: number, combo: number }`
    - Render: fixed top bar with timer (mm:ss format), score, and combo indicator
    - Combo shows "x1", "x2", "x3" with pulse animation on change
    - Timer turns red when under 10 seconds
  - Wire everything in `src/App.tsx`:
    - Import useGameEngine, StartScreen, GameOverScreen, Raindrop, LetterGrid, HUD
    - Use useGameEngine hook with selected difficulty
    - Render based on gamePhase:
      - 'start': <StartScreen onStart={startGame} />
      - 'playing': <HUD /> + <Raindrop /> + <LetterGrid /> in the sky/water layout
      - 'gameover': <GameOverScreen score={score} onReplay={startGame} />
    - Connect handleAnswer to LetterGrid's onSelect
    - Connect handleDropMiss to Raindrop's onMiss
  - Do NOT implement audio (todo 8)
  - Do NOT add any features not described above
  Parallelization: Wave 3 | Blocked by: 2, 3, 4, 5, 6 | Blocks: 8
  References (executor has NO interview context - be exhaustive):
  - src/types.ts (todo 3): Difficulty, GamePhase, DIFFICULTY_CONFIGS
  - src/hooks/useGameEngine.ts (todo 4): gameState, startGame, handleAnswer, handleDropMiss
  - src/components/Raindrop.tsx (todo 5): drop, fallDuration, onMiss props
  - src/components/LetterGrid.tsx (todo 6): options, correctAnswer, difficulty, disabled, onSelect props
  - src/styles/game.css (todo 2): .start-screen, .game-over-screen, .hud, .combo-indicator classes
  - Timer format: `${Math.floor(ms/60000)}:${String(Math.floor((ms%60000)/1000)).padStart(2,'0')}`
  Acceptance criteria (agent-executable):
  - `npx tsc -b` compiles with zero errors
  - `npx vite build` succeeds
  - Start screen shows 3 difficulty buttons
  - Clicking a difficulty starts the game with correct config
  - HUD shows timer counting down, score updating, combo changing
  - Game over screen shows final score after 60 seconds
  - Replay buttons restart the game
  QA scenarios (name the exact tool + invocation):
  - Happy: Start dev server, click Easy, play for a few seconds, verify timer counts down and score updates
  - Failure: Let timer reach 0, verify game over screen appears with score
  Evidence: .omo/evidence/task-7-tamil-raindrop-game.png
  Commit: Y | feat(screens): add start, game-over, and HUD screens with full game wiring

- [x] 8. Add audio effects and final polish (src/utils/audio.ts + integration)
  What to do / Must NOT do:
  - Create `src/utils/audio.ts`:
    - Initialize AudioContext lazily (on first user interaction to avoid autoplay policy)
    - `playPop()`: short sine wave burst (440Hz, 100ms, quick decay) - played on correct answer
    - `playSplash()`: white noise burst (200ms, low-pass filtered) - played on drop miss
    - `playWrong()`: low buzz (220Hz, 150ms, dissonant) - played on wrong answer
    - `playCombo(level: number)`: rising tone (base 440Hz * level, 150ms) - played when combo increases
    - `playTick()`: short click (1000Hz, 50ms) - played every second when timer < 10s
    - All functions are no-op if AudioContext is not available or user hasn't interacted
    - Export a `initAudio()` function to be called on first user click
  - Integrate audio into useGameEngine:
    - Call playPop() on correct answer
    - Call playWrong() on incorrect answer
    - Call playSplash() on drop miss
    - Call playCombo(combo) when combo increases
    - Call playTick() in timer loop when timeRemaining < 10000 and second changes
  - Final polish pass:
    - Ensure all CSS animations are smooth (no jank)
    - Verify Tamil text renders correctly across all components
    - Ensure responsive layout works at common viewport sizes (1920x1080, 1366x768, 768x1024)
    - Add subtle rain particle effect in sky area (CSS-only, pseudo-elements)
    - Ensure water wave animation is subtle and not distracting
    - Verify combo indicator pulses visibly on combo change
    - Verify timer turns red under 10 seconds
  - Do NOT add any new features beyond audio and polish
  - Do NOT bundle any audio files - all synthesized
  Parallelization: Wave 3 | Blocked by: 4, 5, 6, 7 | Blocks: -
  References (executor has NO interview context - be exhaustive):
  - Web Audio API: new AudioContext(), createOscillator(), createGain(), createBiquadFilter()
  - Autoplay policy: AudioContext must be created/resumed after user gesture
  - Oscillator types: 'sine', 'square', 'sawtooth', 'triangle'
  - Gain envelope: gain.setValueAtTime(0.3, ctx.currentTime), gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)
  - White noise: createBuffer with random samples, connect through BiquadFilter (lowpass)
  - src/hooks/useGameEngine.ts (todo 4): integrate audio calls into handleAnswer, handleDropMiss, timer loop
  Acceptance criteria (agent-executable):
  - `npx tsc -b` compiles with zero errors
  - `npx vite build` succeeds
  - Audio functions exist and are callable (no runtime errors)
  - AudioContext is created lazily (not on page load)
  - All game events trigger appropriate sounds
  - No audio files in the bundle (check dist/ output)
  - Responsive at 1920x1080, 1366x768, 768x1024
  QA scenarios (name the exact tool + invocation):
  - Happy: Play the game with sound on, verify pop sound on correct answer, splash on miss, wrong buzz on incorrect, tick in final 10 seconds
  - Failure: Open page without interacting, verify no AudioContext created (check console for errors)
  Evidence: .omo/evidence/task-8-tamil-raindrop-game.txt
  Commit: Y | feat(audio): add synthesized sound effects and visual polish

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [x] F1. Plan compliance audit
  - Verify every "Must have" item from Scope is implemented
  - Verify every "Must NOT have" item is absent (no extra deps, no game engine, no state lib)
  - Verify all 216 Tamil compound letters are correctly generated
  - Verify 3 difficulty tiers work with correct grid sizes and speeds
  - Evidence: .omo/evidence/f1-compliance.txt

- [x] F4. Scope fidelity
  - Confirm no features were added beyond the spec
  - Confirm no external dependencies were added
  - Confirm no files outside src/ were modified (except package.json if Vitest was added)
  - Evidence: .omo/evidence/f4-scope.txt

## Commit strategy
- Each todo gets its own commit (8 commits total)
- Final verification wave: no commit (verification only)
- Commit messages follow conventional commits: feat(scope): description
- All commits are atomic - one logical change per commit

## Success criteria
1. A player can select a difficulty and play a full 60-second round
2. Falling drops display Tamil consonant + vowel equations
3. Tapping the correct compound letter pops the drop and adds score
4. Tapping wrong letter flashes red, freezes input, resets combo
5. Letting a drop reach the bottom splashes it and resets combo
6. Score includes base points + height bonus + combo multiplier
7. Game over screen shows final score with replay option
8. All 216 Tamil compound letters are correctly represented
9. Sound effects play for all game events
10. Visual theme matches water/rain aesthetic
11. Zero external dependencies beyond React
12. TypeScript compiles with zero errors
13. Linting passes with zero errors
