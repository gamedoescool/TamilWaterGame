---
slug: tamil-raindrop-game
status: awaiting-approval
intent: clear
review_required: false
pending-action: write .omo/plans/tamil-raindrop-game.md
approach: Pure React + CSS game with zero external dependencies. Tamil letter data as a static TypeScript module. Game engine as a custom hook with requestAnimationFrame loop. CSS animations for falling drops. CSS Grid for answer buttons. Web Audio API for sound effects. All state in React - no state library needed.
---

# Draft: tamil-raindrop-game

## Components (topology ledger)
| id | outcome | status | evidence |
|----|---------|--------|----------|
| tamil-data | Static module with 18 consonants, 12 vowels, vowel signs, and a generator for all 216 compound letters | active | src/data/tamil-letters.ts |
| game-engine | Custom hook managing game loop, timer, drop spawning, collision detection, scoring, combo, difficulty | active | src/hooks/useGameEngine.ts |
| raindrop | Falling drop component with CSS animation, showing consonant + vowel equation | active | src/components/Raindrop.tsx |
| letter-grid | Responsive grid of answer buttons, layout adapts to difficulty (2x2, 2x3, 2x4) | active | src/components/LetterGrid.tsx |
| hud | Timer countdown, score display, combo multiplier indicator | active | src/components/HUD.tsx |
| screens | Start screen (difficulty select), game-over screen (final score) | active | src/components/StartScreen.tsx, GameOverScreen.tsx |
| visuals | Sky gradient background, water body at bottom, rain/particle effects, pop/splash animations | active | src/styles/game.css |
| audio | Web Audio API synthesized pop/splash/tick sounds, no external audio files | active | src/utils/audio.ts |

## Open assumptions (announced defaults)
| assumption | adopted default | rationale | reversible? |
|-----------|----------------|-----------|-------------|
| Animation approach | CSS keyframe animations for raindrop fall, React state for position tracking | CSS animations are GPU-accelerated and smooth; position tracked via onAnimationIteration/onTransitionEnd for hit detection | yes |
| Sound effects | Web Audio API oscillator-based synthesis | Zero external assets, works offline, no loading | yes |
| State management | React useState + useReducer, no external library | Game state is simple enough for built-in React state | yes |
| Styling approach | Plain CSS with CSS modules (index.css + component styles) | Matches existing project setup, no extra deps | yes |
| Tamil font | System Tamil font stack (Noto Sans Tamil, TAU_Elango, system-ui) | No font file to bundle, works on all modern OS | yes |
| Game layout | Full viewport height, top half = sky + falling drops, bottom half = button grid + water | Matches the rain/water theme described in spec | yes |
| Difficulty selection | Start screen with 3 buttons (Easy/Medium/Hard) | Simple, no dropdown needed | yes |

## Findings (cited - path:lines)
- Project is a fresh Vite 8 + React 19 + TypeScript 6 template (package.json:12-14)
- React Compiler enabled via babel plugin (vite.config.ts:9) - no need for useMemo/useCallback
- No existing game code, no dependencies beyond React (package.json:12-14)
- Tamil Unicode block U+0B80-U+0BFF contains all needed characters
- 18 consonants (U+0B95-U+0BB5) x 12 vowels (U+0B85-U+0B94) = 216 compound letters
- Vowel modifier signs are separate code points from standalone vowels (e.g., ஆ standalone = U+0B86, but modifier ா = U+0BBE)
- Pre-base modifiers (ெ, ே, ை, ொ, ோ, ௌ) render LEFT of consonant - handled by font renderer
- Compound vowel signs ொ(U+0BCA), ோ(U+0BCB), ௌ(U+0BCC) each decompose to 2 code points in NFD

## Decisions (with rationale)
1. **No external dependencies** - The game is self-contained with React + CSS + Web Audio. No need for game engines, animation libs, or state management libraries. Keeps bundle tiny and deploy simple.
2. **CSS animations for raindrop fall** - Use CSS `@keyframes` with `animation-duration` set per difficulty. Track drop position via `requestAnimationFrame` reading `getBoundingClientRect()` for height bonus calculation. CSS handles the smooth animation; JS handles game logic.
3. **Game loop via requestAnimationFrame** - A single rAF loop in the game engine hook checks timer, spawns drops, and detects misses. No setInterval drift.
4. **Compound letter generation at module load** - Generate all 216 compounds once in tamil-letters.ts as a constant array. No runtime computation.
5. **Web Audio API for sounds** - Synthesize pop (short sine burst), splash (noise burst), tick (click), and combo (rising tone) using oscillators. Zero asset loading.

## Scope IN
- Full 60-second game rounds with countdown timer
- 3 difficulty tiers (Easy/Medium/Hard) with distinct speeds and grid sizes
- Falling raindrops displaying consonant + vowel equations
- Button grid with correct answer + N-1 random distractors
- Scoring: base 100pts + height bonus + combo multiplier (1x/2x/3x)
- Correct tap: pop animation, score add, combo increase, next drop
- Incorrect tap: red flash, 0.5s input freeze, combo reset
- Drop miss: splash animation, combo reset, new drop spawns
- Start screen with difficulty selection
- Game over screen showing final score
- Water/rain visual theme (sky gradient, animated drops, water body at bottom)
- Sound effects (pop, splash, tick, combo)
- Responsive layout that works on desktop and tablet

## Scope OUT (Must NOT have)
- No multiplayer or online features
- No persistent high score storage (localStorage or backend)
- No settings page or configuration UI
- No mobile-native features (haptics, notifications)
- No internationalization beyond Tamil
- No tutorial or onboarding flow
- No achievements or unlockables
- No custom font bundling (use system Tamil fonts)
- No external game engine (Phaser, PixiJS, etc.)
- No state management library (Redux, Zustand, etc.)

## Open questions
None remaining - all decisions resolved via spec + defaults.

## Approval gate
status: awaiting-approval
pending-action: write .omo/plans/tamil-raindrop-game.md
approach: Pure React + CSS game, zero deps, 8 components across 3 waves. Tamil data module first, then game engine + visual shell, then screens + audio polish.
