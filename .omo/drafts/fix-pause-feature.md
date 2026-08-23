---
slug: fix-pause-feature
status: awaiting-approval
intent: clear
pending-action: write .omo/plans/fix-pause-feature.md
approach: Track pause duration in a ref, adjust all drop startTimes on resume, pause CSS animations via animation-play-state, and freeze nextSpawnTimeRef
---

# Draft: fix-pause-feature

## Components (topology ledger)
| id | outcome | status | evidence |
|---|---|---|---|
| useGameEngine | Pause/resume logic correctly freezes and resumes game state | active | src/hooks/useGameEngine.ts |
| Raindrop | CSS animation pauses when game is paused | active | src/components/Raindrop.tsx, src/styles/game.css |
| App | Pause overlay renders correctly, keyboard shortcut works | active | src/App.tsx |

## Open assumptions (announced defaults)
| assumption | adopted default | rationale | reversible? |
|---|---|---|---|
| Keyboard shortcut | Escape key toggles pause | Standard game convention | yes |
| CSS pause mechanism | animation-play-state: paused via className | Clean, no JS animation rewrite needed | yes |

## Findings (cited - path:lines)

**Bug 1: CSS animations continue during pause**
- `src/styles/game.css:59-61` - `.raindrop-falling` uses `animation: fall var(--fall-duration) linear forwards` which runs independently of JS game loop
- `src/hooks/useGameEngine.ts:167-168` - Game loop only checks `phase !== 'playing'` but has no control over CSS animations
- When paused, drops continue visually falling behind the overlay

**Bug 2: Drop positions jump after resume (time drift)**
- `src/hooks/useGameEngine.ts:189-193` - Fall detection uses `Date.now() - drop.startTime` which includes pause duration
- `src/hooks/useGameEngine.ts:228` - Only `lastFrameTimeRef` is reset on resume; `drop.startTime` values are NOT adjusted
- After resume, all drops immediately "miss" because elapsed time exceeds fallDuration

**Bug 3: Spawn timer continues during pause**
- `src/hooks/useGameEngine.ts:198` - `nextSpawnTimeRef.current` is compared to `Date.now()` which advances during pause
- After resume, a burst of drops spawn immediately because the spawn timer expired during pause

**Bug 4: No keyboard shortcut for pause**
- `src/components/HUD.tsx:43` - Pause button exists but no keyboard listener for Escape key
- `src/App.tsx:65-74` - Pause overlay renders but no keyboard handler

## Decisions (with rationale)
1. **Track pause duration via ref** - Add `pauseStartRef` to record when pause begins, compute delta on resume, adjust all drop startTimes and nextSpawnTimeRef. Reversible, minimal change.
2. **CSS animation pause via className** - Add `paused` class to raindrop container when phase is 'paused', use `animation-play-state: paused`. Clean CSS-only solution.
3. **Escape key handler** - Add useEffect in App.tsx to listen for Escape key and call togglePause. Standard UX pattern.

## Scope IN
- Fix pause/resume timing (drop startTime adjustment)
- Pause CSS raindrop animations
- Add Escape keyboard shortcut
- Fix spawn timer drift after pause

## Scope OUT (Must NOT have)
- No changes to game mechanics, scoring, or difficulty
- No changes to visual design or styling (except adding pause-related CSS class)
- No new features beyond pause fix
- No refactoring of unrelated code

## Open questions
None - all issues are clear from code analysis.

## Approval gate
status: awaiting-approval
Approach: Track pause duration in a ref, adjust all drop startTimes on resume, pause CSS animations via animation-play-state, and freeze nextSpawnTimeRef. Three files to modify: useGameEngine.ts, App.tsx, game.css.
