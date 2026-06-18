# CLAUDE.md

Project memory for Claude Code. This file is read automatically at the start of every session —
keep it short and durable. Per-task instructions go in your prompt, not here.

## What this is
A habit-streak tracker for **Android** (React Native via Expo), built for personal use. Users create
named streaks, tap a ring to log a day (grey → green), and open a streak to see a month calendar of
logged vs missed days. The design files are iOS-styled — match the *look*, but render with Android
primitives. The finish line is a standalone APK installed on my own phone.

## Design source of truth
- `README.md` — product + visual spec (colors, spacing, exact look). Match it faithfully.
- `Streak App B.dc.html` — interactive prototype. Read its markup/logic for layout and behavior.
- `ios-frame.jsx` — **preview-only device bezel. DO NOT PORT IT.** RN runs on the real device.
- `ARCHITECTURE.md` / `BUILD_PLAN.md` — the technical plan. Follow these.

## Non-negotiable conventions
- **TypeScript strict.** No `any` without a comment justifying it.
- **Data model is date-based.** Persist `loggedDates: string[]` (local `YYYY-MM-DD` keys). Derive
  `count`, `best`, `loggedToday`, calendar, and 7-day strip — never store them. The prototype's
  day-number + `±1 count` approach is demo-only; do not replicate it.
- **Dates are local, never UTC.** Build keys from `getFullYear/getMonth/getDate`. Never use
  `toISOString()` for a date key. Parse keys back with `'T00:00:00'`.
- **Design tokens live in `src/lib/theme.ts`.** No hardcoded hex in components.
- **Pure date logic in `src/lib/dates.ts`, with tests in `__tests__/`.**
- **Android-only, so:** shadows use `elevation` (Android ignores iOS `shadow*` props); never hardcode
  top padding — use `useSafeAreaInsets()`; bundle Inter for the weight-800 headings (Roboto won't
  render them). See `ARCHITECTURE.md` §6.

## Commands
- `npx expo start` — run the app
- `npm test` — run unit tests (date logic must stay green)
- `npx tsc --noEmit` — typecheck

## Working style
- Build in the phases defined in `BUILD_PLAN.md`. Pause at each "Done when" checkpoint for review.
- Typecheck and run tests before declaring a phase complete.
- When unsure about a UX rule (e.g. when a streak "breaks"), state your assumption rather than guessing silently.
- Test on an Android emulator (or my own device via Expo Go) at each checkpoint.
