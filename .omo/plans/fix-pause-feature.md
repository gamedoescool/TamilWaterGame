# fix-pause-feature - Work Plan

## TL;DR (For humans)
<!-- Fill this LAST, after the detailed plan below is written, so it summarizes the REAL plan. -->
<!-- Plain English for a non-engineer: NO file paths, NO todo numbers, NO wave/agent/tool names. -->

**What you'll get:** A working pause feature that freezes the game completely when paused and resumes smoothly from the exact same state.

**Why this approach:** The current pause only stops the JavaScript timer but CSS animations keep running and drop positions get out of sync. We fix this by tracking pause duration, adjusting all time references on resume, and pausing CSS animations.

**What it will NOT do:** No changes to game mechanics, scoring, difficulty, or visual design. Only the pause feature is touched.

**Effort:** Short
**Risk:** Low - isolated changes to 3 files, no architectural changes
**Decisions to sanity-check:** Using CSS `animation-play-state: paused` instead of JS-based animation control; Escape key as pause shortcut

Your next move: approve, or run a high-accuracy review. Full execution detail follows below.

---

> TL;DR (machine): Short effort, Low risk - fix pause feature: track duration, freeze CSS animations, add Escape key

## Scope
### Must have
- Pause/resume timing fix (drop startTime adjustment)
- CSS animation pause via animation-play-state
- Escape keyboard shortcut
- Spawn timer drift fix

### Must NOT have (guardrails, anti-slop, scope boundaries)
- No changes to game mechanics, scoring, or difficulty
- No changes to visual design or styling (except adding pause-related CSS class)
- No new features beyond pause fix
- No refactoring of unrelated code

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: tests-after + manual QA via dev server
- Evidence: .omo/evidence/task-{N}-fix-pause-feature.md

## Execution strategy
### Parallel execution waves
> Target 5-8 todos per wave. Fewer than 3 (except the final) means you under-split.

**Wave 1** (parallel): Tasks 1 and 2 can run in parallel - they modify different files (useGameEngine.ts vs App.tsx + game.css)

**Wave 2** (sequential): Task 3 depends on both 1 and 2 being complete (needs working pause logic to test Escape key)

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. Pause duration tracking | none | 3 | 2 |
| 2. CSS animation pause | none | 3 | 1 |
| 3. Escape key shortcut | 1, 2 | none | none |

## Todos
> Implementation + Test = ONE todo. Never separate.
<!-- APPEND TASK BATCHES BELOW THIS LINE WITH edit/apply_patch - never rewrite the headers above. -->

- [ ] 1. Add pause duration tracking to useGameEngine
  What to do / Must NOT do: Add `pauseStartRef` useRef to track when pause begins. In `togglePause`, when transitioning to 'paused', set `pauseStartRef.current = performance.now()`. When transitioning to 'playing', compute `pauseDuration = performance.now() - pauseStartRef.current` and adjust all falling drops' `startTime` by adding `pauseDuration`. Also adjust `nextSpawnTimeRef.current` by adding `pauseDuration`. Do NOT change any other timing logic.
  Parallelization: Wave 1 | Blocked by: none | Blocks: 2, 3
  References (executor has NO interview context - be exhaustive): src/hooks/useGameEngine.ts:223-230 (togglePause), src/hooks/useGameEngine.ts:59-68 (drop.startTime), src/hooks/useGameEngine.ts:72-73 (nextSpawnTimeRef), src/hooks/useGameEngine.ts:189-193 (fall detection using Date.now() - drop.startTime)
  Acceptance criteria (agent-executable): After pause/resume, drops do not immediately splash; timer continues from where it left off; no burst of spawns after resume
  QA scenarios (name the exact tool + invocation): Play game, pause for 3 seconds, resume - verify drops continue falling from same position, timer does not jump, no spawn burst. Evidence .omo/evidence/task-1-fix-pause-feature.md
  Commit: N | will commit with task 3

- [ ] 2. Pause CSS raindrop animations when game is paused
  What to do / Must NOT do: In App.tsx, add a `paused` className to the `.sky-area` div when `gameState.phase === 'paused'`. In game.css, add `.sky-area.paused .raindrop-falling { animation-play-state: paused; }` to freeze CSS animations. Do NOT change any other CSS or animation logic.
  Parallelization: Wave 1 | Blocked by: none | Blocks: 3
  References (executor has NO interview context - be exhaustive): src/App.tsx:45-56 (sky-area div with raindrops), src/styles/game.css:59-61 (.raindrop-falling animation), src/styles/game.css:16-21 (.sky-area)
  Acceptance criteria (agent-executed): When paused, raindrops visually freeze in place; when resumed, they continue from same position
  QA scenarios (name the exact tool + invocation): Play game, observe drops falling, pause - verify drops freeze visually, resume - verify drops continue from frozen position. Evidence .omo/evidence/task-2-fix-pause-feature.md
  Commit: N | will commit with task 3

- [ ] 3. Add Escape keyboard shortcut for pause toggle
  What to do / Must NOT do: In App.tsx, add a useEffect that listens for 'keydown' events. When Escape key is pressed AND gameState.phase is 'playing' or 'paused', call `togglePause()`. Clean up the event listener on unmount. Do NOT add any other keyboard shortcuts.
  Parallelization: Wave 2 | Blocked by: 1, 2 | Blocks: none
  References (executor has NO interview context - be exhaustive): src/App.tsx:12-76 (App component), src/hooks/useGameEngine.ts:223-230 (togglePause function), src/types.ts:3 (GamePhase type)
  Acceptance criteria (agent-executable): Pressing Escape while playing pauses the game; pressing Escape while paused resumes the game; Escape does nothing on start or game over screens
  QA scenarios (name the exact tool + invocation): Play game, press Escape - verify pause overlay appears, press Escape again - verify game resumes. Test on start screen - Escape should do nothing. Evidence .omo/evidence/task-3-fix-pause-feature.md
  Commit: Y | fix(game): pause feature - track duration, freeze CSS animations, add Escape key

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [ ] F1. Plan compliance audit - Verify all 3 todos completed, all acceptance criteria met
- [ ] F2. Code quality review - No new lint errors, clean TypeScript, no unused imports
- [ ] F3. Real manual QA - Play game, pause/resume multiple times, verify drops freeze/resume correctly, timer accurate, Escape key works
- [ ] F4. Scope fidelity - No changes outside pause feature fix

## Commit strategy
Single commit after all tasks complete: `fix(game): pause feature - track duration, freeze CSS animations, add Escape key`

## Success criteria
1. Pausing the game freezes all raindrop animations visually
2. Resuming the game continues drops from exact same position (no time jump)
3. Timer continues from where it left off after pause/resume
4. No burst of spawns after resume
5. Escape key toggles pause on/off
6. No changes to game mechanics, scoring, or visual design
