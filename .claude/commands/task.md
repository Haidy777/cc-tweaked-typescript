Read CLAUDE.md before doing anything.

Ask questions instead of assuming anything!

## Before implementing

**Understand the context:**
- Identify which area this task belongs to (`src/types`, `src/lib`, `src/scripts`)
- Check existing code patterns before writing new code
- If the task involves architecture or tooling choices, ask — don't assume

**Plan before writing code:**
- Outline your approach
- If choosing between multiple valid approaches, ask rather than assume
- Flag any ambiguity before starting

## While implementing

- Only modify files directly related to the task — don't clean up unrelated code
- Remember: target runtime is Lua 5.1 in ComputerCraft, NOT Node.js
- Do not use Node.js APIs — use CC:Tweaked globals (`fs`, `os`, `term`, `turtle`, `peripheral`)
- Type declarations go in `src/types/` as `.d.ts` files — no runtime code
- Reusable utilities go in `src/lib/`
- Standalone programs go in `src/scripts/`
- All code, comments, and docs in English

## Verification — prove your work, don't just claim it

- **Build:** run `npm run build` and show it completes without errors
- **Lint:** run `npm run lint` and show it passes
- **New types:** show that the types compile correctly with a usage example
- **New script:** show `npm run build` produces the expected `.lua` file in `build/`

If you cannot verify something (e.g. in-game behavior), say so explicitly.

Task: $ARGUMENTS
