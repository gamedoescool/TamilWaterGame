# multi-raindrop-v2 - Work Plan

## TL;DR (For humans)

**What you'll get:** A chaotic rainfall game where Tamil compound letter drops appear at random intervals and fall from the sky. At the bottom, a target equation (e.g., "க + ஆ") tells you which compound to find. Click the right raindrop before it falls away. Drops keep spawning randomly - no respawning when one is gone. Same scoring, same 60-second rounds, same difficulty tiers.

**Why this approach:** Refactor the existing game engine from single-drop to continuous multi-drop spawning. Replace the LetterGrid with a TargetDisplay component. Make Raindrop clickable. 5 files modified, 1 new, 1 deleted.

**What it will NOT do:** No changes to start/gameover screens, HUD, audio, scoring formula. No new dependencies.

**Effort:** Short (5 todos across 2 waves)
**Risk:** Low - refactoring existing patterns, no new deps
**Decisions to sanity-check:** Random spawn intervals by difficulty, no replacement drops, max concurrent drop cap

Your next move: approve, or run a high-accuracy review first.

---

> TL;DR (machine): Short effort, Low risk, 5 todos across 2 waves. Refactor to continuous random-interval multi-drop rain with target display. 5 files modified, 1 new, 1 deleted.

## Scope
### Must have
- Raindrops spawn continuously at random intervals (chaotic rainfall feel)
- Spawn interval scales with difficulty: Easy 1500-3000ms, Medium 800-1800ms, Hard 400-1000ms
- Max concurrent drops capped (Easy: 6, Medium: 8, Hard: 12) to avoid overwhelming the screen
- Each drop shows a compound letter (combined Tamil letter, not equation)
- Target display at bottom showing consonant + vowel equation (e.g., "க + ஆ")
- Exactly 1 active drop matches the current target at any time
- Click the correct raindrop to score
- Correct click: pop animation, score + height bonus * combo, combo up, cycle to new target
- Wrong click (non-target drop): red flash, 0.5s freeze, combo reset
- Drop miss (falls out): splash, combo reset. If it was the target, cycle to new target
- NO replacement drops - when a drop is gone (clicked/missed), it's gone
- Scoring unchanged (100 base + height bonus * combo)
- All existing features preserved (timer, HUD, start/gameover screens, audio)

### Must NOT have
- No changes to start screen, game over screen, HUD, or audio module
- No changes to scoring formula
- No new external dependencies
- No replacement/respawn drops when one is removed

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: tests-after (manual verification via build + typecheck)
- Evidence: .omo/evidence/

## Execution strategy
### Parallel execution waves

**Wave 1 (Core refactor):** Types + Engine + Raindrop + TargetDisplay
- Todos 1, 2 can parallel (types + target display)
- Todo 3 (engine) depends on 1
- Todo 4 (raindrop) depends on 1

**Wave 2 (Integration):** App wiring + CSS cleanup
- Todo 5 depends on 1, 2, 3, 4

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. types.ts | - | 3, 4, 5 | 2 |
| 2. TargetDisplay.tsx | - | 5 | 1 |
| 3. useGameEngine.ts | 1 | 5 | 4 |
| 4. Raindrop.tsx | 1 | 5 | 3 |
| 5. App.tsx + CSS + delete LetterGrid | 1, 2, 3, 4 | - | - |

## Todos
> Implementation + Test = ONE todo. Never separate.

- [x] 1. Update types for multi-drop + target (src/types.ts)
  What to do / Must NOT do:
  - Modify `DropState`: add `status: 'wrong'` to the status union (for red flash on wrong click)
    - New: `status: 'falling' | 'popped' | 'splashed' | 'wrong'`
  - Modify `DifficultyConfig`: replace `gridSize`, `columns`, `rows` with:
    - `spawnIntervalMin: number` (minimum ms between drops)
    - `spawnIntervalMax: number` (maximum ms between drops)
    - `maxConcurrentDrops: number` (cap on active drops)
    - easy: `{ fallDuration: 7000, spawnIntervalMin: 1500, spawnIntervalMax: 3000, maxConcurrentDrops: 6, label: 'Easy' }`
    - medium: `{ fallDuration: 5000, spawnIntervalMin: 800, spawnIntervalMax: 1800, maxConcurrentDrops: 8, label: 'Medium' }`
    - hard: `{ fallDuration: 3000, spawnIntervalMin: 400, spawnIntervalMax: 1000, maxConcurrentDrops: 12, label: 'Hard' }`
  - Modify `GameState`: replace `currentDrop: DropState | null` and `options: string[]` with:
    - `drops: DropState[]` (array of all active drops)
    - `targetCompound: string` (the compound letter the player must find, e.g., 'கா')
    - `targetConsonant: string` (consonant char, e.g., 'க')
    - `targetVowel: string` (vowel char, e.g., 'ஆ')
  - Do NOT change Difficulty, GamePhase types
  Parallelization: Wave 1 | Blocked by: - | Blocks: 3, 4, 5
  References: src/types.ts:1-39 (current full file)
  Acceptance criteria: `npx tsc -b` exits 0, DifficultyConfig has spawnIntervalMin/Max/maxConcurrentDrops, GameState has drops/targetCompound/targetConsonant/targetVowel, DropState status includes 'wrong'
  QA: `npx tsc -b` exits 0
  Commit: Y | feat(types): update types for multi-drop game loop with random intervals

- [x] 2. Create TargetDisplay component (src/components/TargetDisplay.tsx)
  What to do / Must NOT do:
  - Create new component `src/components/TargetDisplay.tsx`
  - Props: `{ consonant: string, vowel: string }`
  - Render: `<div className="target-display">` containing:
    - `<div className="target-equation">{consonant} + {vowel}</div>` (the equation, e.g., "க + ஆ")
    - `<div className="target-hint">Find this compound!</div>` (subtle hint text)
  - The component is purely presentational - no game logic
  - Styled with `.target-display` class (CSS in todo 5)
  - Do NOT import React (React 19)
  - Do NOT add any click handlers or game logic
  Parallelization: Wave 1 | Blocked by: - | Blocks: 5
  References: src/components/HUD.tsx (pattern reference for simple presentational component)
  Acceptance criteria: `npx tsc -b` exits 0, component renders consonant + vowel equation
  QA: `npx tsc -b` exits 0
  Commit: Y | feat(target): add TargetDisplay component for consonant+vowel equation

- [x] 3. Refactor game engine for continuous random-interval spawning (src/hooks/useGameEngine.ts)
  What to do / Must NOT do:
  - Replace `currentDrop` state with `drops: DropState[]` (array)
  - Add `targetCompound`, `targetConsonant`, `targetVowel` state
  - Remove `options` state (no longer needed)
  - **New spawn system (continuous random intervals):**
    - `startGame()` picks an initial target and spawns the first drop (matching target)
    - A `spawnTimerRef` manages a `setTimeout` loop:
      - After each spawn, schedule next spawn at `randomBetween(config.spawnIntervalMin, config.spawnIntervalMax)`
      - On each spawn tick: if `drops.length < config.maxConcurrentDrops`, spawn a new drop
      - New drop gets a random consonant/vowel pair → random compound
      - ~50% chance the new drop is the target compound (ensures target drops appear regularly without being too frequent)
      - If no drop currently matches the target, force the next spawn to be the target compound
      - Each new drop gets `startTime: Date.now()` and `status: 'falling'`
    - Spawn timer runs continuously during 'playing' phase, stops on 'gameover'
  - **Target cycling (`cycleTarget` internal):**
    - Pick a new random target (consonant + vowel) → new targetCompound
    - Update targetConsonant, targetVowel, targetCompound
    - Check if any existing falling drop matches the new target
    - If yes: great, that drop is now the target
    - If no: the next spawn will be forced to produce the target compound
  - **`handleDropClick(clickedDropId: string)`:**
    - If inputFrozen or phase !== 'playing': return
    - Find the clicked drop in the drops array
    - If clicked drop's compound === targetCompound (CORRECT):
      - Calculate height bonus from that drop's progress: `heightBonus = floor((1 - min(progress, 1)) * 50)`
      - Score += (100 + heightBonus) * combo
      - Combo = min(combo + 1, 3)
      - Set that drop's status to 'popped'
      - playPop() + playCombo()
      - After 300ms: remove popped drop from array, call cycleTarget()
    - If clicked drop's compound !== targetCompound (WRONG):
      - Combo = 1
      - Set that drop's status to 'wrong'
      - playWrong()
      - Set inputFrozen = true for 500ms
      - After 500ms: remove the wrong drop from array (it's gone), set inputFrozen = false
  - **rAF timer loop (modified):**
    - Each frame: check ALL drops in the array
    - For each drop with status='falling' and elapsed >= fallDuration:
      - Set status to 'splashed'
      - playSplash()
      - If this drop was the target: combo = 1, cycleTarget()
      - After 200ms: remove splashed drop from array
    - NO replacement spawning - drops are only spawned by the timer loop
  - **Game over:**
    - When timeRemaining <= 0: set phase to 'gameover', clear all drops, stop spawn timer
  - Return: `{ gameState, startGame, handleDropClick }` (remove handleAnswer, handleDropMiss)
  - Keep all audio integration (playPop, playSplash, playWrong, playCombo, playTick)
  - Use refs for stable callbacks (spawnDropRef pattern)
  Parallelization: Wave 1 | Blocked by: 1 | Blocks: 5
  References: src/hooks/useGameEngine.ts:1-177 (current full file), src/types.ts (updated in todo 1)
  Acceptance criteria: `npx tsc -b` exits 0, hook returns gameState with drops array and target fields, handleDropClick exists, no replacement drops
  QA: `npx tsc -b` exits 0
  Commit: Y | feat(engine): refactor game engine for continuous random-interval multi-drop spawning

- [x] 4. Make Raindrop clickable + show compound (src/components/Raindrop.tsx)
  What to do / Must NOT do:
  - Add `onClick: (dropId: string) => void` prop
  - Change display from `{drop.consonantChar} + {drop.vowelChar}` to `{drop.correctCompound}` (show the compound letter, not the equation)
  - Add `cursor: pointer` style (via CSS class, not inline)
  - Add onClick handler: `onClick={() => onClick(drop.id)}`
  - Handle 'wrong' status: add `raindrop-wrong` class for red flash
  - Update classList to include 'raindrop-wrong' when status === 'wrong'
  - Keep all existing animation logic (falling, popped, splashed)
  - Do NOT change the fall animation or horizontal position logic
  Parallelization: Wave 1 | Blocked by: 1 | Blocks: 5
  References: src/components/Raindrop.tsx:1-48 (current full file)
  Acceptance criteria: `npx tsc -b` exits 0, component accepts onClick prop, displays compound letter, handles 'wrong' status
  QA: `npx tsc -b` exits 0
  Commit: Y | feat(raindrop): make raindrop clickable, show compound letter

- [x] 5. Wire App.tsx + update CSS + delete LetterGrid
  What to do / Must NOT do:
  - **App.tsx changes:**
    - Remove `LetterGrid` import
    - Add `TargetDisplay` import
    - Use `handleDropClick` instead of `handleAnswer`/`handleSelect`
    - Remove `wrongIndex` state (no longer needed)
    - Render multiple Raindrops: `gameState.drops.filter(d => d.status !== 'splashed').map(drop => <Raindrop key={drop.id} drop={drop} fallDuration={config.fallDuration} onClick={handleDropClick} />)`
    - Render TargetDisplay in water area: `<TargetDisplay consonant={gameState.targetConsonant} vowel={gameState.targetVowel} />`
    - Remove all LetterGrid-related code
  - **CSS changes (src/styles/game.css):**
    - Add `.raindrop { cursor: pointer; }`
    - Add `.raindrop-wrong`: red flash animation (background: var(--wrong), then fade back, 0.3s)
    - Add `.target-display`: centered in water area, large text, backdrop blur, rounded
    - Add `.target-equation`: large Tamil font (2.5rem), prominent, font-family: var(--tamil-font)
    - Add `.target-hint`: smaller (0.9rem), dimmer text below
    - Remove `.letter-grid`, `.letter-grid--easy/medium/hard`, `.letter-btn`, `.letter-btn--correct/wrong/frozen` styles (dead code)
  - **Delete file:** `src/components/LetterGrid.tsx`
  - Do NOT change start screen, game over screen, HUD, or audio
  Parallelization: Wave 2 | Blocked by: 1, 2, 3, 4 | Blocks: -
  References: src/App.tsx:1-79 (current full file), src/styles/game.css:1-345 (current full file), src/components/LetterGrid.tsx (to delete)
  Acceptance criteria: `npx tsc -b` exits 0, `npx vite build` succeeds, LetterGrid.tsx deleted, no imports of LetterGrid anywhere
  QA: `npx tsc -b && npx vite build` both exit 0
  Commit: Y | feat(game): wire multi-drop game loop, add target display, remove letter grid

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE.
- [x] F1. Plan compliance audit
  - Verify drops spawn at random intervals (not all at once)
  - Verify spawn interval scales with difficulty
  - Verify no replacement drops
  - Verify target display shows consonant + vowel equation
  - Verify clicking correct drop scores points
  - Verify clicking wrong drop freezes + resets combo
  - Verify drop miss splashes + cycles target if it was the target
  - Verify scoring formula unchanged
  - Verify LetterGrid deleted and not imported anywhere

- [x] F4. Scope fidelity
  - No changes to start/gameover screens, HUD, audio
  - No new dependencies
  - No changes to scoring formula

## Commit strategy
- Each todo gets its own commit (5 commits total)
- Commit messages follow conventional commits

## Success criteria
1. Raindrops spawn continuously at random intervals (chaotic rainfall)
2. Spawn rate is faster on harder difficulties
3. No replacement drops when one is removed
4. Each drop shows a compound letter (கா, not க + ஆ)
5. Target display at bottom shows "க + ஆ" equation
6. Clicking the correct drop pops it and adds score
7. Clicking wrong drop flashes red, freezes, resets combo
8. Drop falling out of view splashes, cycles target if it was the target
9. Scoring unchanged (100 + height bonus * combo)
10. All existing features preserved (timer, HUD, screens, audio)
11. LetterGrid component deleted
12. TypeScript compiles with zero errors
13. Vite build succeeds
