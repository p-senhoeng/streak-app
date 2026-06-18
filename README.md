# Handoff: Streak Logging App (iOS / React Native)

## Overview
A simple habit-streak tracker. The user creates named streaks, logs each one per day by tapping a ring (grey → green), and can open any streak to see a month calendar showing which days were logged and which were missed (where the streak broke). Each streak shows a current-streak day count and a "last 7 days" dot strip.

## About the Design Files
The files in this bundle are **design references created in HTML** — a working prototype showing the intended look and behavior. They are **not production code to copy directly**. The task is to **recreate this design in React Native** (the user's stated target) using its established patterns and libraries. `Streak App B.dc.html` is a custom HTML "Design Component" format; open it in a browser to interact with it, or read the markup/logic to understand layout and state. `ios-frame.jsx` is only a mock device bezel for previewing — **do not port it**; React Native runs on the real device.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, and interactions are specified below. Recreate the UI to match, using React Native primitives and your chosen component/styling approach.

## Recommended RN Stack
- **Navigation**: `@react-navigation/native` (native-stack) — Home → Detail.
- **State**: local component state is enough for a prototype; for persistence use `@react-native-async-storage/async-storage` (or SQLite/WatermelonDB if scaling). Streaks and their logged dates should persist across launches.
- **Icons**: the checkmark, plus, and back chevron are simple — use `react-native-svg` or an icon set (e.g. `lucide-react-native`).
- **Haptics**: `expo-haptics` (`Haptics.impactAsync(Light)`) on every log tap to match the intended "subtle pulse" feedback.

---

## Screens / Views

### 1. Home — Streak list
- **Purpose**: See all streaks, log today with one tap, add new streaks, open a streak for history.
- **Layout**: Vertical scroll. Screen background `#F2F2F7`.
  - **Header**: padding `60` top (safe-area + nav) / `22` sides / `14` bottom. Left: title "Streaks" (`30px`, weight `800`, color `#1a1d1a`, letter-spacing `-0.6`) with subtitle below (`14px`, `#9aa0a6`, "Tap a ring to log · tap a card for history"). Right, bottom-aligned: a `34×34` circular **+ button** (background = accent, white plus glyph; scales to `0.9` on press).
  - **Add composer** (conditional, shown when + tapped): a white row, radius `16`, margin `0 16 12`, padding `10 12`, subtle shadow. Contains a borderless text input ("New streak…", `16px`) and an **Add** button (accent bg, white, radius `12`, height `38`, weight `600`). Submit on Enter or Add; trims empty names; closes on add.
  - **Streak cards**: vertical list, `gap 12`, side padding `16`. Each card:
    - White, radius `20`, padding `16 18`, shadow `0 1px 3px rgba(0,0,0,0.05)`. The whole card is tappable → opens Detail.
    - **Top row** (flex, align center, gap 14): left column = name (`17px`, weight `600`, `#1a1d1a`, letter-spacing `-0.3`) and, below it, the count (`30px`, weight `800`, **accent color**, letter-spacing `-0.6`) followed by "day streak" (`13px`, `#9aa0a6`). Right = the **log ring** (see Components). The ring's tap must NOT bubble to the card (stopPropagation) — ring logs, card navigates.
    - **Bottom row** (margin-top 14, flex space-between): left = "last 7 days" as 7 dots (`7×7`, radius `9`, gap `7`); a logged day = accent dot, an unlogged day = `#e3e5e8` dot. Right = caption "last 7 days" (`11px`, `#c2c7cd`). The 7 dots map to calendar days 12–18 (today is the 18th, the rightmost dot).

### 2. Detail — Streak history
- **Purpose**: View a streak's full month, see logged vs missed days, log today.
- **Layout**: Vertical scroll. Background `#F2F2F7`.
  - **Back row**: padding `58 16 0`. A tappable row: back chevron (accent stroke) + "Streaks" (`17px`, weight `500`, accent). → returns to Home.
  - **Title**: streak name, `28px`, weight `800`, `#1a1d1a`, letter-spacing `-0.5`. Padding `14 22 12`.
  - **Stat card**: white, radius `20`, padding `18`, margin `0 16`, shadow. Left: big current count (`40px`, weight `800`, accent, letter-spacing `-1`) + "day streak" (`14px`, `#9aa0a6`); below, "Best · N days" (`13px`, `#b4b9bf`). Right: a `52×52` **log ring** with a caption underneath — "Logged" (accent, weight 600) when today is logged, "Log today" (`#9aa0a6`) when not.
  - **Calendar card**: white, radius `20`, padding `18`, margin `16`, shadow.
    - Month label: "June 2026" (`17px`, weight `700`, `#1a1d1a`). *(Prototype hardcodes June 2026 with "today" = the 18th. In the real app, drive this from the device date.)*
    - Weekday header: 7-col grid, gap 6, labels `M T W T F S S` (Monday-first), centered, `12px`, weight 600, `#c2c7cd`.
    - Day grid: 7-col grid, gap 6. Leading blank cells for the first-of-month weekday offset (Monday-first). Each day is a circle (`aspect-ratio 1`, radius 50%, `14px`, weight 600, centered). Cell states below.
    - Legend (margin-top 18, flex gap 18): accent dot "Logged", `#fbe9e8` dot "Missed", dashed-accent ring "Today".

---

## Components

### Log ring (the core interaction)
A circular toggle that de-greys when logged. Implemented as two stacked layers so it can animate smoothly:
- **Base layer**: filled accent circle with a **white** checkmark (SVG path `M5 12.5 l4.5 4.5 L19 7`, stroke-width ~2.6, round caps), always present underneath.
- **Cover layer** (absolutely positioned, same size): white circle, `2px` solid `#d7dbe0` border, with a **grey** (`#c2c7cd`) checkmark. Its `opacity` is `1` when unlogged and `0` when logged, with `transition: opacity 0.4s ease`. Fading it out reveals the green base = the "de-grey" effect.
- **Press feedback**: the ring container scales to ~`0.84`–`0.86` while pressed, returning with a springy ease (`cubic-bezier(.34,1.56,.64,1)`). In RN, use `Pressable` + `Animated`/`react-native-reanimated` `withSpring`, plus a light haptic on log.
- **Sizes**: 42×42 in list cards, 52×52 on the detail stat card, 34×34 for the checkmark in calendar (calendar uses filled circles, not the two-layer ring).
- **Tap**: toggles `loggedToday`. Tapping again un-logs. On the home card, stop propagation so the card's navigation doesn't also fire.

### Calendar day cell states
- **Logged** (past day in `logged` set, OR today when logged): filled accent circle, white number.
- **Missed** (past day NOT in `logged` set): background `#fbe9e8`, number `#d4716b`. This is the "lost the streak" marker.
- **Today, not yet logged**: transparent fill, `2px dashed` accent border, accent number.
- **Future** (day > today): transparent, number `#c8ccd1`.

---

## Interactions & Behavior
- **Log / un-log**: tap a ring → toggle today's logged state. Logged increments the streak count by 1; un-logging decrements (floor 0). Ring cover fades over 0.4s; fire a light haptic.
- **Add streak**: tap + → composer appears → type name → Enter/Add → new card appended (count 0, not logged, empty history). Empty/whitespace names are ignored.
- **Open detail**: tap a card body → push Detail for that streak.
- **Back**: chevron/"Streaks" → pop to Home.
- **Sync**: logging on Home and on Detail affect the same streak; the calendar's "today" cell and the home dot strip reflect `loggedToday` live.
- **Press animation**: rings spring-scale on press (≈0.84–0.86), +/Add buttons scale to 0.9.

## State Management
Per streak:
- `id` (string/number), `name` (string)
- `count` (number) — current streak length; can exceed the visible month (streaks span months).
- `best` (number) — longest streak.
- `loggedToday` (boolean) — whether today is logged.
- `logged` (number[] for the prototype) — day-numbers logged in the displayed month. **For production**, store actual logged **dates** (ISO `YYYY-MM-DD` Set/array) instead of day numbers, and derive `count`, `best`, `loggedToday`, the calendar, and the 7-day strip from those dates + the real current date. The prototype's hardcoded "June 2026 / today = 18" is only for demo.
- App-level: `view`/route, `selectedId`, composer `draft` string + `composing` boolean.

Derivations to implement for real data:
- `loggedToday` = dates includes today.
- `count` = consecutive logged days ending at today (or yesterday if today not yet logged — decide your rule; prototype simply stores and ±1s on toggle).
- Calendar cell = logged / missed (past & not logged) / today / future.

## Design Tokens
- **Accent** (default Green `#16a34a`; prototype also offers Blue `#2563eb`, Amber `#f59e0b` — ship Green, others optional theming).
- **Backgrounds**: screen `#F2F2F7`, cards `#fff`.
- **Text**: primary `#1a1d1a`; secondary `#9aa0a6`; tertiary/captions `#b4b9bf` / `#c2c7cd` / `#c8ccd1`.
- **Ring cover border**: `#d7dbe0`. **Unlogged dot**: `#e3e5e8`. **Missed day bg**: `#fbe9e8`, **missed number**: `#d4716b`.
- **Radii**: cards `20`, list container `22`, composer `16`, Add button `12`, rings/dots `50%`.
- **Shadow**: `0 1px 3px rgba(0,0,0,0.05)`.
- **Spacing**: card gap `12`, side padding `16`, card inner padding `16–18`, calendar grid gap `6`.
- **Type**: system font (`-apple-system` → RN default `System`/SF). Sizes: title `30`/`28`, big count `30`/`40`, name `17`, body `16`, caption `13`/`12`/`11`. Weights: `800` titles/counts, `600` names/labels, `500` body/back.
- **Motion**: ring opacity `0.4s ease`; press scale spring `cubic-bezier(.34,1.56,.64,1)`.

## Assets
No image assets. Icons are simple SVGs (check, plus, back chevron) — recreate with `react-native-svg` or an icon library. No brand assets.

## Files
- `Streak App B.dc.html` — the full prototype (Home + Detail, all logic). Read the `<script>` logic class for exact state/handlers and the markup for layout. Open in a browser to interact.
- `ios-frame.jsx` — preview-only device bezel; **ignore for the RN build**.
