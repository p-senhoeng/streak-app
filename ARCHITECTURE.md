# Technical Architecture — Streak Logging App

> This document covers the **how-to-build** layer. The visual spec (colors, spacing,
> exact pixel values, component look) lives in `README.md` and the design files —
> this doc does not repeat them. Read both together.

---

## 1. Stack & why

| Concern | Choice | Why this over the alternatives |
|---|---|---|
| Framework | **Expo (managed) + React Native** | Targeting **Android only, for personal use**. Expo handles native modules (haptics, fonts) without you touching Gradle, and — crucially for a tool you'll actually use daily — it gives you the easiest path to get a real app onto your own phone (see §6). |
| Language | **TypeScript (strict)** | The data model has a few subtle shapes (dates, derived values). Types catch the "I passed a `Date` where a string was expected" class of bug at compile time instead of at runtime on a user's phone. Industry standard; learn it now. |
| Navigation | **@react-navigation/native + native-stack** | Two screens (Home → Detail). Native-stack gives you real platform transitions for free. (Expo Router is a fine alternative if you'd rather learn file-based routing — but the handoff specifies React Navigation, so we'll match it.) |
| State | **React Context + `useReducer`** | One small list of streaks. Redux/MobX would be ceremony for no payoff. A reducer keeps all mutations in one auditable place, which matters because our state has invariants (no duplicate dates). Reach for **Zustand** only if this grows into something bigger. |
| Persistence | **AsyncStorage** | A single JSON blob of streaks. SQLite/WatermelonDB are for when you have thousands of rows and need queries — not here. |
| Animation | **react-native-reanimated** | The ring's spring-scale and opacity fade need to run on the UI thread to stay smooth during a tap. Reanimated does that; plain `Animated` can jank. |
| Haptics | **expo-haptics** | `Haptics.impactAsync(Light)` on every log tap — matches the "subtle pulse" intent. |
| Icons | **react-native-svg** | The three glyphs (check, plus, chevron) are trivial SVG paths. No icon library needed, though `lucide-react-native` is fine if preferred. |

---

## 2. The data model — read this twice

This is the single most important decision in the app, and it's where the prototype is
**deliberately wrong** (it's a demo, not production — the README says so explicitly).

### What the prototype does (don't copy this)
It stores logged *day numbers* (`[1,2,3,...]` within June) and **mutates `count` by ±1** on
each toggle. This is the classic "denormalized state that drifts" antipattern. It breaks the
moment you cross a month boundary, relaunch the app, or toggle in a way the counter didn't
anticipate. It exists only so the static HTML can look right.

### What you should build instead: one source of truth
Store **the set of dates each streak was logged**, as local `YYYY-MM-DD` strings. Derive
*everything else* — current count, best, "logged today", the calendar, the 7-day strip — from
that set plus the real current date. Derived values can never drift out of sync with the truth,
because there's only one truth.

```ts
type Streak = {
  id: string;          // crypto.randomUUID() or Date.now().toString()
  name: string;
  createdAt: string;   // ISO timestamp
  loggedDates: string[]; // sorted, de-duped, "YYYY-MM-DD" local-date keys
};
```

That's the *entire* persisted shape. Note what's **not** here: `count`, `best`, `loggedToday`.
Those are computed on render.

### The derivation functions (build these first, test them in isolation)

These belong in `src/lib/dates.ts` and should have unit tests **before** any UI touches them.
Bugs here are invisible until a user hits midnight or a month edge — tests are how you catch
them on your machine instead of in the wild.

```ts
// Local date key — NOT toISOString(). See pitfall #1 below.
export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Current streak. RULE (decide consciously): the streak counts the run of
// consecutive logged days ending today. If today isn't logged YET, we count
// back from yesterday so the streak isn't shown as "broken" before the day is
// over (Duolingo-style grace). It only truly breaks once a full day passes unlogged.
export function currentStreak(logged: Set<string>, today = new Date()): number {
  const cursor = new Date(today);
  if (!logged.has(toDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (logged.has(toDateKey(cursor))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

// Longest run ever.
export function bestStreak(loggedDates: string[]): number {
  if (loggedDates.length === 0) return 0;
  const sorted = [...new Set(loggedDates)].sort();
  let best = 1, run = 1;
  for (let i = 1; i < sorted.length; i++) {
    // Parse with explicit local midnight to avoid a UTC shift (pitfall #1).
    const prev = new Date(sorted[i - 1] + 'T00:00:00').getTime();
    const cur  = new Date(sorted[i]     + 'T00:00:00').getTime();
    const diffDays = Math.round((cur - prev) / 86_400_000);
    run = diffDays === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  return best;
}
```

The calendar cell state and the 7-day strip are likewise pure functions of `loggedDates` + today.
Because `currentStreak` walks the full set, the count correctly spans months — `Meditate` can
read 13 even though only part of June is visible.

---

## 3. Folder structure

```
streak-app/
├─ App.tsx                 # NavigationContainer + StreakProvider
├─ src/
│  ├─ screens/
│  │  ├─ HomeScreen.tsx
│  │  └─ DetailScreen.tsx
│  ├─ components/
│  │  ├─ Ring.tsx          # the two-layer log toggle (core interaction)
│  │  ├─ StreakCard.tsx
│  │  ├─ WeekDots.tsx      # last-7-days strip
│  │  ├─ CalendarMonth.tsx
│  │  └─ Composer.tsx      # add-streak input row
│  ├─ store/
│  │  └─ StreakContext.tsx # Context + reducer + AsyncStorage hydrate/persist
│  ├─ lib/
│  │  ├─ dates.ts          # toDateKey, currentStreak, bestStreak, calendar derivation
│  │  └─ theme.ts          # design tokens (accent, colors, radii, spacing)
│  └─ types.ts
└─ __tests__/
   └─ dates.test.ts
```

Keep every hardcoded color/size from the README in `theme.ts`. Scattering hex values across
components is the thing you'll regret first when you want to tweak the accent.

---

## 4. State flow

```
StreakProvider (Context + useReducer)
  state:   { streaks: Streak[], hydrated: boolean }
  actions: ADD_STREAK(name) | TOGGLE_TODAY(id) | HYDRATE(streaks)
  effect:  on mount → load from AsyncStorage → HYDRATE
           on every state change (after hydrated) → persist to AsyncStorage
```

- `TOGGLE_TODAY` adds or removes **today's** date key from `loggedDates`. It must **dedupe** —
  toggling on then on again should never produce two copies of today.
- Screens read `streaks` from context and call `dispatch`. They never hold their own copy of a
  streak's data — that would reintroduce the drift problem.
- Both Home and Detail dispatch the same `TOGGLE_TODAY`, so logging in one place updates the other
  automatically. That's the payoff of a single store.

---

## 5. The Ring component

Faithful to the README's two-layer design:

- **Base layer**: filled accent circle + white check, always rendered underneath.
- **Cover layer**: white circle, grey check, `opacity` animated `1 → 0` over `0.4s` when logged.
  Fading the cover *reveals* the green base — that's the "de-grey" effect. (Don't swap colors;
  cross-fade the cover.)
- **Press**: `Pressable` + reanimated `withSpring` scaling the container to ~`0.84`, plus a light
  haptic on each tap.
- Used at 42px (cards), 52px (detail). The calendar uses plain filled circles, **not** this component.

---

## 6. Android notes & getting it onto your phone

The design files are **iOS-styled** (the bezel, dynamic island, liquid-glass keyboard in
`ios-frame.jsx` are preview-only — ignore them entirely). You're building the Android app; it
should *look* like the design but render with Android primitives. A few Android specifics:

1. **Shadows = `elevation`.** Android doesn't read iOS `shadow*` props — it renders shadows via a
   single `elevation` number (which needs a solid background). The README's soft
   `0 1px 3px rgba(0,0,0,0.05)` won't reproduce exactly; `elevation: 2` on the cards gets you the
   right *feel*. Don't chase pixel parity with the iOS shadow. Put it in `theme.ts`:
   ```ts
   export const cardShadow = { elevation: 2 }; // Android
   ```

2. **Heavy font weights.** Android's system font (Roboto) doesn't reliably render weight 800, so the
   design's bold titles/counts can look lighter than intended. The one nicety worth doing: bundle
   **Inter** (`@expo-google-fonts/inter` + `expo-font`), which ships a real 800, and reference it in
   `theme.ts`. Skip it and you'll just get a slightly lighter heading — not a dealbreaker for a
   personal tool.

3. **Safe area.** Don't hardcode the README's `padding: 60` top (that's an iOS notch value). Use
   `useSafeAreaInsets()` from `react-native-safe-area-context` so the layout clears the Android
   status bar correctly on your device.

4. **The hardware back button.** native-stack wires Android's system back button to pop the screen
   automatically, so Home ← Detail just works. Don't add custom back handling that fights it.

### Running it on your own phone
For *development*, `npx expo start` + the **Expo Go** app (scan the QR) is the fastest loop. But Expo
Go needs your laptop's dev server running — no good for daily use. To actually *keep and use* the app:

- Build a standalone **APK** with EAS: `eas build -p android --profile preview` produces an installable
  `.apk` you sideload onto your phone. It runs on its own, no dev server, data persists via AsyncStorage.
- That's the personal-use finish line: build the APK, install it, log your streaks each day.

---

## 7. Pitfalls to watch (the stuff that bites juniors and seniors alike)

1. **Timezone / the UTC date bug — #1 cause of broken streak apps.**
   `new Date().toISOString()` returns **UTC**. Near midnight, a user in a negative-offset timezone
   gets *yesterday's* or *tomorrow's* date, and their streak silently breaks or double-counts.
   Always build date keys from local components (`getFullYear/getMonth/getDate`), as in `toDateKey`.
   When parsing a key back to a `Date`, append `'T00:00:00'` so it's parsed as local midnight.

2. **"Today" must be live.** Don't hardcode the 18th (that's the prototype). Compute today at
   render, and recompute when the app returns to the foreground (`AppState` listener) — someone
   can leave the app open across midnight.

3. **RN doesn't bubble taps like the DOM.** The README's `stopPropagation` is a web concept. In RN,
   nest the ring's `Pressable` inside the card's `Pressable`; the innermost responder wins, so the
   ring handles its own tap without firing the card's navigation. Verify this by tapping the ring
   and confirming you *don't* navigate.

4. **AsyncStorage is async.** On launch you'll briefly have no data. Render a loading state (or
   nothing) until `hydrated` is true, then show the list — otherwise you flash an empty screen,
   then pop in the streaks.

5. **Dedupe on toggle.** Use a `Set` semantics for `loggedDates`. A double-fire of the handler
   must not create duplicate entries (which would corrupt `bestStreak`).

6. **Reanimated + haptics threading.** Animation runs on the UI thread (worklets); fire the haptic
   from the JS callback (`onPress`), not inside a worklet.

7. **Define the streak-break rule and stick to it.** We chose the grace rule (§2). Whatever you
   pick, make `currentStreak`, the calendar "today" cell, and the 7-day strip all agree — they're
   the same truth viewed three ways.

---

## 8. Out of scope for v1 (don't gold-plate)
Notifications/reminders, multiple themes shipping (ship Green; leave the accent token swappable),
cloud sync, editing/deleting streaks, charts beyond the month calendar. Get the core loop solid first.
