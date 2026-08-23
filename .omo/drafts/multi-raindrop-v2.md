---
slug: multi-raindrop-v2
status: awaiting-approval
intent: clear
review_required: false
pending-action: write .omo/plans/multi-raindrop-v2.md
approach: Refactor game loop from "one drop + answer grid" to "continuous random-interval rain + target display". Player clicks the correct raindrop instead of selecting from a grid. No replacement drops. 5 files modified, 1 new component, 1 deleted.
---

# Draft: multi-raindrop-v2

## Components (topology ledger)
| id | outcome | status | evidence |
|----|---------|--------|----------|
| types | Update DropState, GameState, DifficultyConfig for multi-drop + target | active | src/types.ts |
| engine | Refactor useGameEngine: multiple drops array, target compound, click-drop handler | active | src/hooks/useGameEngine.ts |
| raindrop | Make Raindrop clickable, show compound letter instead of equation | active | src/components/Raindrop.tsx |
| target-display | New component showing "க + ஆ" target in water area | active | src/components/TargetDisplay.tsx |
| app | Wire multiple drops + target display, remove LetterGrid | active | src/App.tsx |
| styles | Update CSS for clickable drops, target display, remove grid styles | active | src/styles/game.css |

## Open assumptions (announced defaults)
| assumption | adopted default | rationale | reversible? |
|-----------|----------------|-----------|-------------|
| Drop count per difficulty | Easy=4, Medium=6, Hard=8 | Matches original grid sizes, scales difficulty | yes |
| Target cycling | New target spawned immediately after correct click or drop miss | Keeps game flowing, no dead time | yes |
| Drop respawn | When a drop is removed (clicked/missed), spawn a replacement after short delay | Maintains constant rain density | yes |
| One correct drop at a time | Exactly 1 of N drops matches the target | Clear gameplay, no ambiguity | yes |
| Drop display | Show compound letter (கா) not equation (க + ஆ) | Player needs to recognize the compound | yes |

## Findings (cited - path:lines)
- Current: single DropState, single currentDrop (types.ts:5-14, useGameEngine.ts:26)
- Current: LetterGrid renders answer buttons (LetterGrid.tsx:1-37)
- Current: Raindrop shows equation "க + ஆ" (Raindrop.tsx:45)
- Current: handleAnswer checks selected compound against currentDrop.correctCompound (useGameEngine.ts:85-112)
- Current: DifficultyConfig has gridSize, columns, rows for grid layout (types.ts:16-22)

## Decisions (with rationale)
1. **Multiple drops as array** - Replace `currentDrop: DropState | null` with `drops: DropState[]`. Each drop has its own startTime, position, and status.
2. **Target as separate state** - `targetCompound: string` + `targetConsonant: string` + `targetVowel: string` stored in GameState. Displayed by new TargetDisplay component.
3. **Raindrop becomes clickable** - Add `onClick` prop to Raindrop. Show compound letter (கா) instead of equation (க + ஆ).
4. **Remove LetterGrid** - No longer needed. Delete the component file.
5. **Drop count from DifficultyConfig** - Replace `gridSize/columns/rows` with `dropCount: number` in config.
6. **Staggered spawning** - Drops spawn with slight delays (200-500ms apart) so they don't all appear at once.

## Scope IN
- Multiple simultaneous raindrops (4/6/8 by difficulty)
- Each drop shows a compound letter (the combined Tamil letter)
- Target display at bottom showing "க + ஆ" equation
- Click the correct raindrop to score
- Correct click: pop animation, score + height bonus * combo, combo up, new target + replacement drop
- Wrong click (clicking non-target drop): red flash on drop, 0.5s freeze, combo reset
- Drop miss (falls out of view): splash, combo reset, new target + replacement drop
- Scoring logic unchanged (100 base + height bonus + combo multiplier)
- All existing features preserved (timer, HUD, start/gameover screens, audio)

## Scope OUT
- No changes to start screen, game over screen, HUD, or audio
- No changes to scoring formula
- No new dependencies
- No changes to difficulty speeds (fallDuration stays the same)

## Open questions
None - all resolved.

## Approval gate
status: awaiting-approval
pending-action: write .omo/plans/multi-raindrop-v2.md
approach: Refactor 5 files + 1 new component + delete LetterGrid. Multi-drop array, target display, clickable raindrops.
