# Build Plan — Streak Logging App

Build in **phases**, and review at each checkpoint before moving on. This matters when working
with an agent like Claude Code: a single giant generation is hard to review and hides bugs. Small,
verifiable slices let you catch a wrong turn on phase 2 instead of debugging the whole app at the end.

Each phase has a **Done when** line — that's your acceptance check before continuing.

---

## Phase 0 — Scaffold ✅
- Create Expo app with TypeScript template.
- Install: `@react-navigation/native`, `@react-navigation/native-stack`, `react-native-screens`,
  `react-native-safe-area-context`, `react-native-reanimated`, `react-native-svg`,
  `@react-native-async-storage/async-storage`, `expo-haptics`.
- Configure the reanimated babel plugin. Set TS to `strict: true`.
- Set up `NavigationContainer` with an empty Home and Detail screen.

**Done when:** the app boots on an **Android emulator (or your phone via Expo Go)** and you can navigate Home → Detail → back with placeholder text.

---

## Phase 1 — Theme tokens & types ✅
- `src/lib/theme.ts`: every color, radius, spacing, font size/weight from `README.md`'s Design Tokens.
- Add the `cardShadow` helper (`{ elevation: 2 }` for Android) and bundle **Inter** via `expo-font`
  so the weight-800 titles render properly (Roboto won't). See `ARCHITECTURE.md` §6.
- `src/types.ts`: the `Streak` type (see ARCHITECTURE §2).

**Done when:** tokens are referenced from one file; no hardcoded hex *or* inline shadow props sit in a component yet.

---

## Phase 2 — Date logic (+ tests) ✅
- `src/lib/dates.ts`: `toDateKey`, `currentStreak`, `bestStreak`, `loggedToday`, calendar-cell
  derivation, last-7-days derivation.
- `__tests__/dates.test.ts`: cover the tricky cases —
  - streak counts across a month boundary,
  - today-not-yet-logged grace rule,
  - a gap breaks the streak,
  - `bestStreak` finds a past run longer than the current one,
  - a date key near midnight is the **local** date (not UTC).

**Done when:** `npm test` passes and the edge cases above are green. This is the foundation; if it's
wrong, everything above it is wrong too.

---

## Phase 3 — Store ✅
- `src/store/StreakContext.tsx`: Context + `useReducer` with `ADD_STREAK`, `TOGGLE_TODAY`, `HYDRATE`.
- Hydrate from AsyncStorage on mount; persist on every change once hydrated.
- Seed with the README's sample streaks **converted to the date model** (real dates relative to
  today, not the prototype's day-numbers) so the UI has something to show in dev.

**Done when:** you can dispatch a toggle from a throwaway button, kill the app, relaunch, and the change persisted.

---

## Phase 4 — Ring component ✅
- `src/components/Ring.tsx`: two-layer design, reanimated spring press-scale, opacity cross-fade,
  light haptic on tap. Props: `logged`, `size`, `onToggle`.

**Done when:** tapping toggles grey↔green with the spring + fade, and you feel the haptic on a real device.

---

## Phase 5 — Home screen ✅
- Header (title + subtitle + accent `+` button), `Composer` (conditional), `StreakCard` list, `WeekDots`.
- Wire cards to the store; card body navigates, ring toggles (verify the ring tap does **not** navigate — pitfall #3).
- Add-streak flow: `+` → composer → Enter/Add → appended; empty names ignored.

**Done when:** Home matches the design, you can add a streak and log/un-log from a card.

---

## Phase 6 — Detail screen ✅
- Back row, title, stat card (big count + best + ring + log label), `CalendarMonth`, legend.
- Drive the calendar from **real** today + the selected streak's `loggedDates`.
- Logging on Detail reflects on Home (and vice versa) — same store.

**Done when:** Detail matches the design, cell states (logged/missed/today/future) are correct, and logging stays in sync across screens.

---

## Phase 7 — Polish ✅
- Loading state during hydration (pitfall #4).
- `AppState` listener to recompute "today" when returning to foreground (pitfall #2).
- Empty state for zero streaks.
- Replace any hardcoded top padding with `useSafeAreaInsets()` so the layout clears the Android status bar.
- Verify Android: card shadows render via elevation, weight-800 headings look right (Inter), system back button pops Detail.
- Basic accessibility: `accessibilityRole`/`accessibilityLabel` on the ring ("Log today / Logged"),
  the `+` button, and cards. Min 44dp touch targets.

**Done when:** app handles relaunch, midnight rollover, and zero-streak gracefully; rings are screen-reader labelled.

---

## Phase 8 — Ship it to your phone
- `eas build -p android --profile preview` → produces an installable `.apk`.
- Sideload the APK onto your phone, confirm it runs with no dev server and that streaks persist
  across relaunches.

**Done when:** you're logging your real streaks on a standalone app, no laptop required.
